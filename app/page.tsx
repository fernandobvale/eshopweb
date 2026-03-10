import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import type { SiteSettings, Post, Category } from "@/types/supabase";
import Header from "@/components/blog/Header";
import Footer from "@/components/blog/Footer";
import PostCard from "@/components/blog/PostCard";
import ConversionBanner from "@/components/blog/ConversionBanner";
import type { Metadata } from "next";
import { buildItemListJsonLd, buildOpenGraph, buildOrganizationJsonLd, buildTwitterCard, buildWebSiteJsonLd } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 300;

async function getData() {
    const supabase = createSupabaseAdminClient();
    const [settingsRes, postsRes, categoriesRes] = await Promise.all([
        supabase.from("site_settings").select("*").eq("tenant_id", TENANT_ID).maybeSingle(),
        supabase
            .from("posts")
            .select("*")
            .eq("tenant_id", TENANT_ID)
            .eq("status", "published")
            .order("published_at", { ascending: false })
            .limit(13),
        supabase.from("categories").select("*").eq("tenant_id", TENANT_ID).order("name"),
    ]);
    return {
        settings: settingsRes.data as SiteSettings | null,
        posts: (postsRes.data ?? []) as Post[],
        categories: (categoriesRes.data ?? []) as Category[],
    };
}

export async function generateMetadata(): Promise<Metadata> {
    const { settings } = await getData();
    const title = settings?.meta_title || settings?.display_title || settings?.site_name || "SEO Blog";
    const description = settings?.meta_description || settings?.display_subtitle || settings?.site_description || undefined;
    const image = settings?.default_og_image_url || settings?.logo_url || undefined;

    return {
        title: { absolute: title },
        description: description,
        alternates: {
            canonical: "/",
        },
        openGraph: buildOpenGraph({
            title: title,
            description: description,
            image,
            url: "/",
            type: "website",
        }),
        twitter: buildTwitterCard({
            title,
            description,
            image,
        }),
    };
}

export default async function HomePage() {
    const { posts, categories, settings } = await getData();
    const siteName = settings?.display_title || settings?.site_name || "SEO Blog";
    const siteSubtitle = settings?.display_subtitle || "Onde a tecnologia encontra a performance.";
    const siteDescription = settings?.meta_description || settings?.display_subtitle || settings?.site_description || undefined;
    const homePosts = settings?.home_layout === "featured" ? posts.slice(0, 13) : posts.slice(0, 12);
    const webSiteJsonLd = buildWebSiteJsonLd({ description: siteDescription });
    const organizationJsonLd = buildOrganizationJsonLd({
        name: siteName,
        description: siteDescription,
        logo: settings?.logo_url || undefined,
        socialUrls: [settings?.facebook_url, settings?.instagram_url, settings?.linkedin_url],
    });
    const itemListJsonLd = buildItemListJsonLd(
        homePosts.map((post) => ({ name: post.title, url: `/${post.slug}` }))
    );

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
            {/* Organization JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
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
                <section className="py-20 bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-6xl mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-neutral-900 dark:text-white mb-6 tracking-tight">
                            {siteName}
                        </h1>
                        <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            {siteSubtitle}
                        </p>
                    </div>
                </section>

                {settings?.banner_active && (
                    <section className="max-w-6xl mx-auto px-4 pt-10">
                        <ConversionBanner settings={settings} variant="home" />
                    </section>
                )}

                {/* Latest Posts */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Conteúdos Recentes</h2>
                        <Link href="/arquivo" className="text-brand-500 hover:underline text-sm font-semibold">Ver todos →</Link>
                    </div>

                    {homePosts.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-100 dark:bg-neutral-900 rounded-3xl">
                            <p className="text-neutral-500">Estamos preparando os primeiros conteúdos. Volte em breve!</p>
                        </div>
                    ) : settings?.home_layout === "list" ? (
                        <div className="flex flex-col gap-6">
                            {homePosts.map((post) => (
                                <Link key={post.id} href={`/${post.slug}`} className="group flex flex-col md:flex-row gap-6 p-4 rounded-3xl hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                    <div className="relative aspect-video md:w-64 rounded-2xl overflow-hidden shrink-0">
                                        {post.cover_image_url && (
                                            <Image
                                                src={post.cover_image_url}
                                                alt={post.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 256px"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 py-2 text-left">
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-neutral-500 line-clamp-2 text-sm">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : settings?.home_layout === "featured" ? (
                        <div className="space-y-12">
                            {/* Featured Post */}
                            <Link href={`/${homePosts[0].slug}`} className="group block relative aspect-[21/9] rounded-[40px] overflow-hidden shadow-2xl">
                                {homePosts[0].cover_image_url && (
                                    <Image
                                        src={homePosts[0].cover_image_url}
                                        alt={homePosts[0].title}
                                        fill
                                        priority
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        sizes="(max-width: 1024px) 100vw, 1200px"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-10 left-10 max-w-2xl text-left">
                                    <h3 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                                        {homePosts[0].title}
                                    </h3>
                                    <p className="text-lg text-neutral-300 line-clamp-2">
                                        {homePosts[0].excerpt}
                                    </p>
                                </div>
                            </Link>

                            {/* Rest of posts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {homePosts.slice(1, 13).map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {homePosts.map((post) => (
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
