import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import Header from "@/components/blog/Header";
import Footer from "@/components/blog/Footer";
import PostCard from "@/components/blog/PostCard";
import type { Post, Category, SiteSettings } from "@/types/supabase";
import type { Metadata } from "next";
import { buildItemListJsonLd, buildOpenGraph, buildTwitterCard, buildWebPageJsonLd } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("site_settings").select("*").eq("tenant_id", TENANT_ID).single();
    const settings = data as SiteSettings | null;
    const title = settings?.meta_title || settings?.display_title || settings?.site_name || "Blog";
    const description = "Todos os conteúdos publicados em nossa plataforma.";
    const image = settings?.default_og_image_url || settings?.logo_url || undefined;
    return {
        title: `Arquivo | ${title}`,
        description,
        alternates: {
            canonical: "/arquivo",
        },
        openGraph: buildOpenGraph({
            title: `Arquivo | ${title}`,
            description,
            image,
            url: "/arquivo",
            type: "website",
        }),
        twitter: buildTwitterCard({
            title: `Arquivo | ${title}`,
            description,
            image,
        }),
    };
}

export default async function ArchivePage() {
    const supabase = createSupabaseAdminClient();

    const [postsRes, settingsRes, categoriesRes] = await Promise.all([
        supabase
            .from("posts")
            .select("*")
            .eq("tenant_id", TENANT_ID)
            .eq("status", "published")
            .order("published_at", { ascending: false }),
        supabase.from("site_settings").select("*").eq("tenant_id", TENANT_ID).single(),
        supabase.from("categories").select("*").eq("tenant_id", TENANT_ID).order("name"),
    ]);

    const posts = (postsRes.data ?? []) as Post[];
    const categories = (categoriesRes.data ?? []) as Category[];
    const settings = settingsRes.data as SiteSettings | null;
    const siteName = settings?.display_title || settings?.site_name || "SEO Blog";
    const webPageJsonLd = buildWebPageJsonLd({
        title: `Arquivo | ${siteName}`,
        description: "Todos os conteúdos publicados em nossa plataforma.",
        url: "/arquivo",
    });
    const itemListJsonLd = buildItemListJsonLd(
        posts.map((post) => ({ name: post.title, url: `/${post.slug}` }))
    );

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
            <Header
                siteName={siteName}
                categories={categories}
                logoUrl={settings?.logo_url}
                isAuthenticated={false}
                urlAbout={settings?.url_about}
                urlContact={settings?.url_contact}
            />

            <main className="flex-1">
                <section className="py-16 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-6xl mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                            Todos os Conteúdos
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-4 max-w-2xl">
                            Navegue por nossa biblioteca completa de artigos, tutoriais e insights.
                        </p>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 py-16">
                    {posts.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-100 dark:bg-neutral-900 rounded-3xl">
                            <p className="text-neutral-500">Nenhum post publicado ainda.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer
                siteName={siteName}
                logoUrl={settings?.logo_url}
                footerText={settings?.footer_text}
                siteDescription={settings?.display_subtitle || settings?.site_description}
                urlAbout={settings?.url_about}
                urlContact={settings?.url_contact}
                urlPrivacy={settings?.url_privacy}
                urlTerms={settings?.url_terms}
            />
        </div>
    );
}
