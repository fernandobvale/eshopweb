import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireAdmin();
    if (!user || user.role === "author") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { name, slug, description } = body;

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("categories")
        .update({ name, slug, description, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("tenant_id", TENANT_ID)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireAdmin();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "Apenas administradores podem excluir categorias" }, { status: 403 });

    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    const { error: detachError } = await supabase
        .from("posts")
        .update({ category_id: null })
        .eq("category_id", id)
        .eq("tenant_id", TENANT_ID);
    if (detachError) return NextResponse.json({ error: detachError.message }, { status: 500 });

    const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("tenant_id", TENANT_ID);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
