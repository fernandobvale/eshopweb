import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function GET() {
    try {
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
            .from("site_settings")
            .select("*")
            .eq("tenant_id", TENANT_ID)
            .maybeSingle();

        if (error) throw error;
        return Response.json({ data });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await req.json();
        if (!body || typeof body !== "object") {
            return Response.json({ error: "Corpo da requisição inválido" }, { status: 400 });
        }

        // Limpeza profunda: remove qualquer campo que seja literalmente a string "undefined" ou "null"
        const updateData: any = {};
        Object.keys(body).forEach(key => {
            const val = body[key];
            if (val !== "undefined" && val !== "null" && val !== undefined && val !== null) {
                // Não incluir campos de controle que não devem ser atualizados diretamente
                if (!["id", "created_at", "updated_at", "tenant_id"].includes(key)) {
                    updateData[key] = val;
                }
            }
        });

        // Sanitize campos UUID conhecidos
        const isUuid = (val: any) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(val));
        if (updateData.main_author_id && !isUuid(updateData.main_author_id)) {
            delete updateData.main_author_id;
        }

        const supabase = createSupabaseAdminClient();
        console.log(`[Settings API] PUT - Tenant ID: ${TENANT_ID}`);

        // Obtém o registro atual deste tenant para saber se atualiza ou insere
        const { data: current, error: fetchError } = await supabase
            .from("site_settings")
            .select("id")
            .eq("tenant_id", TENANT_ID)
            .maybeSingle();

        console.log(`[Settings API] Current record found:`, current);

        if (fetchError) {
            console.error("Erro ao buscar settings:", fetchError);
            throw fetchError;
        }

        let result;
        if (current && current.id) {
            console.log(`[Settings API] Updating existing record with ID: ${current.id}`);
            // Existe -> Atualiza
            const { data, error } = await supabase
                .from("site_settings")
                .update({
                    ...updateData,
                    updated_at: new Date().toISOString()
                })
                .eq("id", current.id)
                .select()
                .single();

            if (error) {
                console.error("[Settings API] Update error:", error);
                throw error;
            }
            result = data;
        } else {
            console.log(`[Settings API] Creating new record for tenant: ${TENANT_ID}`);
            // Não existe -> Insere
            const { data, error } = await supabase
                .from("site_settings")
                .insert({
                    ...updateData,
                    tenant_id: TENANT_ID,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error("Erro no insert de settings:", error);
                throw error;
            }
            result = data;
        }

        // Invalida o cache
        revalidatePath("/");
        revalidatePath("/[slug]", "layout");
        revalidatePath("/arquivo", "layout");
        revalidatePath("/categoria", "layout");

        return Response.json({ data: result });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
