import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import ProfileManager from "./ProfileManager";

export const metadata: Metadata = {
    title: "Gestão de Perfis",
    robots: { index: false, follow: false },
};

export default async function AdminProfilePage() {
    const user = await requireAdmin();
    if (!user) redirect("/acesso");

    const supabase = createSupabaseAdminClient();

    // Fetch all profiles
    const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

    const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

    // Check if current user has a profile, create only when session id is a valid UUID.
    const currentUserProfile = profiles?.find(p => p.id === user.id);
    if (!currentUserProfile && isUuid(user.id)) {
        const { data: newProfile } = await supabase
            .from("profiles")
            .insert({
                id: user.id,
                email: user.email,
                full_name: user.email.split('@')[0],
                role: user.role,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (newProfile && profiles) {
            profiles.push(newProfile);
        }
    }

    const selectedProfileId =
        profiles?.some((p) => p.id === user.id)
            ? user.id
            : (profiles?.[0]?.id ?? "");

    // Fetch site settings to get main_author_id
    const { data: settings } = await supabase
        .from("site_settings")
        .select("main_author_id")
        .eq("tenant_id", TENANT_ID)
        .single();

    return (
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-white">Gestão de Perfis & Autores</h1>
                <p className="text-neutral-400 mt-1 text-sm">Gerencie quem escreve no seu blog e defina o autor principal.</p>
            </header>

            <ProfileManager
                initialProfiles={profiles || []}
                mainAuthorId={settings?.main_author_id ?? null}
                currentUserId={selectedProfileId}
            />
        </div>
    );
}
