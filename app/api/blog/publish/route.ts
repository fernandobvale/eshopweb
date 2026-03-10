import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { toSlug } from "@/lib/seo";

type PublishBody = {
    title?: string;
    content?: string;
    excerpt?: string;
    seo_title?: string;
    seo_description?: string;
    cover_image_url?: string;
    category_slug?: string;
    is_published?: boolean;
};

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

function normalizeBaseUrl() {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
    if (!raw) return "http://localhost:3000";
    return /^https?:\/\//i.test(raw) ? raw.replace(/\/$/, "") : `https://${raw.replace(/\/$/, "")}`;
}

function timingSafeEqualString(a: string, b: string) {
    const encoder = new TextEncoder();
    const aBytes = encoder.encode(a);
    const bBytes = encoder.encode(b);
    if (aBytes.length !== bBytes.length) return false;
    let diff = 0;
    for (let i = 0; i < aBytes.length; i += 1) {
        diff |= aBytes[i] ^ bBytes[i];
    }
    return diff === 0;
}

function stripHtml(html: string) {
    return html
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function makeExcerpt(html: string, maxLen = 180) {
    const plain = stripHtml(html);
    if (plain.length <= maxLen) return plain;
    return `${plain.slice(0, maxLen).trimEnd()}...`;
}

function getReadingTimeMinutes(html: string) {
    const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
}

function unauthorized() {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401, headers: CORS_HEADERS });
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function HEAD() {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET() {
    return NextResponse.json(
        {
            ok: true,
            endpoint: "/api/blog/publish",
            method: "POST",
            auth: "X-API-Key",
            message: "Endpoint ativo. Use POST com Content-Type application/json.",
        },
        { status: 200, headers: CORS_HEADERS }
    );
}

export async function POST(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key")?.trim() ?? "";
        const expectedKey = (process.env.SUPERSEO_API_KEY ?? "").trim();

        if (!expectedKey || !apiKey || !timingSafeEqualString(apiKey, expectedKey)) {
            return unauthorized();
        }

        const body = (await req.json()) as PublishBody;
        const title = body.title?.trim();
        const content = body.content?.trim();

        if (!title) {
            return NextResponse.json(
                { error: "Campo obrigatório ausente: title" },
                { status: 400, headers: CORS_HEADERS }
            );
        }
        if (!content) {
            return NextResponse.json(
                { error: "Campo obrigatório ausente: content" },
                { status: 400, headers: CORS_HEADERS }
            );
        }

        const slug = toSlug(title);
        const isPublished = body.is_published ?? true;
        const status = isPublished ? "published" : "draft";
        const publishedAt = isPublished ? new Date().toISOString() : null;

        const supabase = createSupabaseAdminClient();

        let categoryId: string | null = null;
        if (body.category_slug?.trim()) {
            const categorySlug = toSlug(body.category_slug);
            const { data: category } = await supabase
                .from("categories")
                .select("id")
                .eq("slug", categorySlug)
                .maybeSingle();

            if (category?.id) {
                categoryId = category.id;
            } else {
                const { data: fallbackCategory } = await supabase
                    .from("categories")
                    .select("id")
                    .order("name")
                    .limit(1)
                    .maybeSingle();
                categoryId = fallbackCategory?.id ?? null;
            }
        }

        // Idempotência: tenta localizar por slug ou título antes de criar.
        const { data: bySlug } = await supabase
            .from("posts")
            .select("id, slug")
            .eq("slug", slug)
            .maybeSingle();

        const existing = bySlug
            ? bySlug
            : (await supabase
                .from("posts")
                .select("id, slug")
                .eq("title", title)
                .maybeSingle()).data;

        const payload = {
            title,
            slug,
            content,
            excerpt: body.excerpt?.trim() || makeExcerpt(content),
            seo_title: body.seo_title?.trim() || null,
            seo_description: body.seo_description?.trim() || null,
            cover_image_url: body.cover_image_url?.trim() || null,
            category_id: categoryId,
            status,
            published_at: publishedAt,
            reading_time_minutes: getReadingTimeMinutes(content),
            updated_at: new Date().toISOString(),
        };

        let postId = "";
        let postSlug = slug;

        if (existing?.id) {
            const { data: updated, error: updateError } = await supabase
                .from("posts")
                .update(payload)
                .eq("id", existing.id)
                .select("id, slug")
                .single();

            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 500, headers: CORS_HEADERS });
            }
            postId = updated.id;
            postSlug = updated.slug;
        } else {
            const { data: created, error: insertError } = await supabase
                .from("posts")
                .insert(payload)
                .select("id, slug")
                .single();

            if (insertError) {
                return NextResponse.json({ error: insertError.message }, { status: 500, headers: CORS_HEADERS });
            }
            postId = created.id;
            postSlug = created.slug;
        }

        revalidatePath("/");
        revalidatePath("/arquivo");
        revalidatePath(`/${postSlug}`);

        const url = `${normalizeBaseUrl()}/${postSlug}`;
        return NextResponse.json(
            { id: postId, url, slug: postSlug },
            { status: existing?.id ? 200 : 201, headers: CORS_HEADERS }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Erro interno ao publicar artigo" },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
