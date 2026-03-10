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
            .from("pages")
            .select("*")
            .eq("tenant_id", TENANT_ID)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return Response.json({ data });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const supabase = createSupabaseAdminClient();

        const { data, error } = await supabase
            .from("pages")
            .insert([{ ...body, tenant_id: TENANT_ID }])
            .select()
            .single();

        if (error) throw error;
        revalidatePath("/");
        revalidatePath("/sitemap.xml");
        if (data?.slug) {
            revalidatePath(`/${data.slug}`);
        }
        return Response.json({ data });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
