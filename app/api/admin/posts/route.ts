import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import { toSlug } from "@/lib/seo";

// GET /api/admin/posts — list posts for admin (filtered by tenant)
export async function GET(req: NextRequest) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = 20;
    const from = (page - 1) * limit;

    const supabase = createSupabaseAdminClient();
    const { data, error, count } = await supabase
        .from("posts")
        .select(
            "id, title, slug, status, published_at, created_at, author_id, category_id",
            { count: "exact" }
        )
        .eq("tenant_id", TENANT_ID)
        .order("created_at", { ascending: false })
        .range(from, from + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data, count, page, limit });
}

// POST /api/admin/posts — create post (with tenant_id)
export async function POST(req: NextRequest) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { title, content, excerpt, category_id, status, cover_image_url,
        seo_title, seo_description, canonical_url, og_image_url,
        scheduled_at, tags } = body;

    if (!title) return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });

    const slug = toSlug(body.slug || title);
    const words = (content ?? "").split(/\s+/).length;
    const reading_time_minutes = Math.max(1, Math.ceil(words / 220));
    const published_at = status === "published" ? new Date().toISOString() : body.published_at ?? null;

    const supabase = createSupabaseAdminClient();

    const { data: post, error } = await supabase
        .from("posts")
        .insert({
            title, slug, content, excerpt, category_id,
            author_id: user.id,
            tenant_id: TENANT_ID,
            status: status ?? "draft",
            published_at, scheduled_at,
            cover_image_url, seo_title, seo_description,
            canonical_url, og_image_url, reading_time_minutes,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Link tags if provided
    if (tags?.length && post) {
        const postObj = post as any;
        const tagLinks = tags.map((tag_id: string) => ({ post_id: postObj.id, tag_id }));
        await supabase.from("post_tags").insert(tagLinks);
    }

    return NextResponse.json({ data: post }, { status: 201 });
}
