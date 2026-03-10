import { getSession } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();
        const { error } = await supabase.from("site_settings").select("id").limit(1);

        if (error) {
            return Response.json(
                { ok: false, error: error.message || "Falha na conexão com o banco." },
                { status: 500 }
            );
        }

        return Response.json({ ok: true, message: "Conexão com o Supabase OK." });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro interno do servidor.";
        return Response.json({ ok: false, error: message }, { status: 500 });
    }
}
