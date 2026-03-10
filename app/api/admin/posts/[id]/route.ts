import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import { toSlug } from "@/lib/seo";

// GET /api/admin/posts/[id]
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const supabase = createSupabaseAdminClient();
    const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", TENANT_ID)
        .single();

    if (error || !post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

    const { data: tagLinks, error: tagsError } = await supabase
        .from("post_tags")
        .select("tag_id")
        .eq("post_id", id);

    if (tagsError) return NextResponse.json({ error: tagsError.message }, { status: 500 });

    return NextResponse.json({
        data: {
            ...post,
            post_tags: tagLinks ?? [],
        },
    });
}

// PUT /api/admin/posts/[id]
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { tags, post_tags, ...rest } = body;

    if (rest.title && !rest.slug) rest.slug = toSlug(rest.title);
    if (rest.status === "published" && !rest.published_at) {
        rest.published_at = new Date().toISOString();
    }
    if (rest.content) {
        const words = rest.content.split(/\s+/).length;
        rest.reading_time_minutes = Math.max(1, Math.ceil(words / 220));
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("posts")
        .update(rest)
        .eq("id", id)
        .eq("tenant_id", TENANT_ID)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Replace tags if provided
    if (Array.isArray(tags)) {
        await supabase.from("post_tags").delete().eq("post_id", id);
        if (tags.length) {
            await supabase.from("post_tags").insert(
                tags.map((tag_id: string) => ({ post_id: id, tag_id }))
            );
        }
    }

    return NextResponse.json({ data });
}

// DELETE /api/admin/posts/[id]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("posts").delete().eq("id", id).eq("tenant_id", TENANT_ID);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
