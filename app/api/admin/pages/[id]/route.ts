import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const supabase = createSupabaseAdminClient();

        const pagesQuery = supabase.from("pages") as any;
        const { data, error } = await pagesQuery
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return Response.json({ data });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();
        const { error } = await supabase.from("pages").delete().eq("id", id);

        if (error) throw error;
        return Response.json({ success: true });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
