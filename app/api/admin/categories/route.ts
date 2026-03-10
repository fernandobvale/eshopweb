import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";

export async function GET() {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("tenant_id", TENANT_ID)
        .order("name");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
    const user = await requireAdmin();
    if (!user || user.role === "author") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const body = await req.json();
    const { name, slug, description } = body;

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("categories")
        .insert({ name, slug, description, tenant_id: TENANT_ID })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
}
