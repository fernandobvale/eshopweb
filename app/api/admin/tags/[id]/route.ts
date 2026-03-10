import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { name, slug } = body;

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("tags")
        .update({ name, slug })
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
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    // Check if tag is used in post_tags
    const { count } = await supabase
        .from("post_tags")
        .select("tag_id", { count: "exact", head: true })
        .eq("tag_id", id);

    if (count && count > 0) {
        return NextResponse.json({
            error: "Esta tag está vinculada a posts e não pode ser excluída."
        }, { status: 400 });
    }

    const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", id)
        .eq("tenant_id", TENANT_ID);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
