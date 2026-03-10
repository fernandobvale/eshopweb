import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

function getBaseUrl() {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
    if (!raw) return "http://localhost:3000";
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

const BASE_URL = getBaseUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: `${BASE_URL}/arquivo`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
        { url: `${BASE_URL}/quem-somos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        { url: `${BASE_URL}/contato`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
        { url: `${BASE_URL}/privacidade`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
        { url: `${BASE_URL}/termos`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ];

    const baseEntry: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
    ];

    const hasSupabaseEnv =
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!hasSupabaseEnv) {
        return [...baseEntry, ...staticRoutes];
    }

    try {
        const supabase = createSupabaseAdminClient();

        const [{ data: posts }, { data: categories }, { data: tags }] = await Promise.all([
            supabase
                .from("posts")
                .select("slug, updated_at, published_at")
                .eq("tenant_id", TENANT_ID)
                .eq("status", "published")
                .order("published_at", { ascending: false }),
            supabase
                .from("categories")
                .select("slug, updated_at")
                .eq("tenant_id", TENANT_ID),
            supabase
                .from("tags")
                .select("slug, created_at")
                .eq("tenant_id", TENANT_ID),
        ]);

        const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((post: any) => ({
            url: `${BASE_URL}/${post.slug}`,
            lastModified: new Date(post.updated_at),
            changeFrequency: "weekly",
            priority: 0.8,
        }));

        const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((cat: any) => ({
            url: `${BASE_URL}/categoria/${cat.slug}`,
            lastModified: new Date(cat.updated_at),
            changeFrequency: "monthly",
            priority: 0.5,
        }));

        const tagRoutes: MetadataRoute.Sitemap = (tags ?? []).map((tag: any) => ({
            url: `${BASE_URL}/tag/${tag.slug}`,
            lastModified: new Date(tag.created_at),
            changeFrequency: "weekly",
            priority: 0.4,
        }));

        return [...baseEntry, ...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes];
    } catch {
        return [...baseEntry, ...staticRoutes];
    }
}
