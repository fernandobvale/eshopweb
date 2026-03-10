import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard",
    robots: { index: false, follow: false },
};

async function getStats() {
    const supabase = createSupabaseAdminClient();
    const [posts, published, drafts, categories] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact" }).eq("tenant_id", TENANT_ID).then((r: any) => r.count ?? 0),
        supabase.from("posts").select("id", { count: "exact" }).eq("tenant_id", TENANT_ID).eq("status", "published").then((r: any) => r.count ?? 0),
        supabase.from("posts").select("id", { count: "exact" }).eq("tenant_id", TENANT_ID).eq("status", "draft").then((r: any) => r.count ?? 0),
        supabase.from("categories").select("id", { count: "exact" }).eq("tenant_id", TENANT_ID).then((r: any) => r.count ?? 0),
    ]);
    return { posts, published, drafts, categories };
}

export default async function AdminDashboardPage() {
    const user = await requireAdmin();
    if (!user) redirect("/acesso");

    const stats = await getStats();

    const cards = [
        { label: "Total de Posts", value: stats.posts, color: "from-brand-500 to-brand-700" },
        { label: "Publicados", value: stats.published, color: "from-emerald-500 to-emerald-700" },
        { label: "Rascunhos", value: stats.drafts, color: "from-amber-500 to-amber-700" },
        { label: "Categorias", value: stats.categories, color: "from-sky-500 to-sky-700" },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-neutral-400 mt-1 text-sm">Bem-vindo de volta, {user.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                    <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-xl p-5 shadow-lg`}>
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{card.label}</p>
                        <p className="text-4xl font-bold text-white mt-2">{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
