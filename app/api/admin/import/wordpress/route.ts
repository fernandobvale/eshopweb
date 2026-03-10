import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { XMLParser } from "fast-xml-parser";
import slugify from "slugify";

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function stripHtml(html: string) {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function estimateReadingTimeMinutes(content: string) {
    const plainText = stripHtml(content);
    const words = plainText ? plainText.split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 220));
}

function extractFirstImageUrl(content: string) {
    const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match?.[1] || null;
}

function normalizeCategoryName(input: string) {
    return input.replace(/\s+/g, " ").trim();
}

function shouldIgnoreCategory(name: string) {
    const slug = slugify(name, { lower: true, strict: true });
    return slug === "uncategorized" || slug === "sem-categoria";
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return Response.json({ error: "Arquivo não fornecido" }, { status: 400 });
        }

        const xmlText = await file.text();
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
        });
        const jsonObj = parser.parse(xmlText);

        const channel = jsonObj.rss.channel;
        const items = ensureArray(channel.item);
        const attachmentByPostId: Record<string, string> = {};

        for (const item of items) {
            if (item?.["wp:post_type"] !== "attachment") continue;
            const attachmentId = String(item?.["wp:post_id"] || "");
            const attachmentUrl = item?.["wp:attachment_url"];
            if (attachmentId && attachmentUrl) {
                attachmentByPostId[attachmentId] = attachmentUrl;
            }
        }

        const supabase = createSupabaseAdminClient();
        let importedCount = 0;

        for (const item of items) {
            // Apenas posts publicados e rascunhos de posts comuns
            const postType = item["wp:post_type"];
            if (postType !== "post") continue;

            const title = item.title;
            const content = item["content:encoded"] || "";
            const plainExcerpt = stripHtml(item["excerpt:encoded"] || "");
            const fallbackExcerpt = stripHtml(content).slice(0, 220);
            const excerpt = plainExcerpt || fallbackExcerpt;
            const slug = item["wp:post_name"] || slugify(title, { lower: true });
            const status = item["wp:status"] === "publish" ? "published" : "draft";
            const createdAt = item["wp:post_date_gmt"] || item["wp:post_date"] || new Date().toISOString();
            const publishedAt = status === "published" ? createdAt : null;
            const readingTime = estimateReadingTimeMinutes(content);
            const postmeta = ensureArray(item["wp:postmeta"]);
            const thumbnailMeta = postmeta.find((meta: any) => meta?.["wp:meta_key"] === "_thumbnail_id");
            const thumbnailId = thumbnailMeta?.["wp:meta_value"] ? String(thumbnailMeta["wp:meta_value"]) : "";
            const coverImageUrl =
                (thumbnailId ? attachmentByPostId[thumbnailId] : null) ||
                extractFirstImageUrl(content);

            // Extrair categorias
            const categories = ensureArray(item.category);
            let categoryId = null;

            const mainCat = categories.find((c: any) => c["@_domain"] === "category");
            if (mainCat) {
                const rawCatName = mainCat["#text"] || mainCat;
                const catName = normalizeCategoryName(String(rawCatName || ""));
                const catSlug = slugify(catName, { lower: true, strict: true, locale: "pt" });

                if (!catName || shouldIgnoreCategory(catName)) {
                    // Skip category assignment for generic categories
                } else {
                    // Busca ou cria categoria por slug normalizado para evitar duplicatas por variação de nome
                const { data: catData } = await supabase
                    .from("categories")
                    .select("id, slug")
                    .eq("slug", catSlug)
                    .single();

                if (catData) {
                    categoryId = (catData as any).id;
                } else {
                    const { data: newCat } = await (supabase
                            .from("categories")
                            .insert({ name: catName, slug: catSlug }) as any)
                        .select()
                        .single();
                    categoryId = newCat?.id;
                }
                }
            }

            // Inserir post
            const { error: postError } = await (supabase
                .from("posts")
                .upsert({
                    title,
                    slug,
                    content,
                    excerpt,
                    status,
                    category_id: categoryId,
                    author_id: session.user.id,
                    created_at: createdAt,
                    updated_at: createdAt,
                    published_at: publishedAt,
                    reading_time_minutes: readingTime,
                    cover_image_url: coverImageUrl,
                    seo_title: title,
                    seo_description: excerpt.substring(0, 160)
                }, { onConflict: "slug" }) as any);

            if (!postError) importedCount++;
        }

        return Response.json({ success: true, importedCount });
    } catch (error: any) {
        console.error("Erro na importação:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
