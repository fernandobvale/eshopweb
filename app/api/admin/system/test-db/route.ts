import { getSession } from "@/lib/session";
import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";

export async function GET() {
    try {
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();
        const [tenantRes, settingsRes] = await Promise.all([
            supabase.from("tenants").select("id").eq("id", TENANT_ID).maybeSingle(),
            supabase.from("site_settings").select("id").eq("tenant_id", TENANT_ID).maybeSingle(),
        ]);

        if (tenantRes.error) {
            return Response.json(
                { ok: false, error: tenantRes.error.message || "Falha na conexão com o banco." },
                { status: 500 }
            );
        }
        if (!tenantRes.data) {
            return Response.json(
                {
                    ok: false,
                    error: `TENANT_ID inválido: "${TENANT_ID}". Crie este tenant no banco ou ajuste a variável TENANT_ID no ambiente.`,
                },
                { status: 422 }
            );
        }
        if (settingsRes.error) {
            return Response.json(
                { ok: false, error: settingsRes.error.message || "Falha ao validar configurações do tenant." },
                { status: 500 }
            );
        }
        if (!settingsRes.data) {
            return Response.json(
                {
                    ok: false,
                    error: `Tenant "${TENANT_ID}" existe, mas não possui site_settings. Acesse Configurações e salve uma vez para inicializar.`,
                },
                { status: 422 }
            );
        }

        return Response.json({ ok: true, message: `Conexão com o Supabase OK. Tenant ativo: ${TENANT_ID}` });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro interno do servidor.";
        return Response.json({ ok: false, error: message }, { status: 500 });
    }
}
