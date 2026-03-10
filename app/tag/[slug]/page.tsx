import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/blog/Header";
import Footer from "@/components/blog/Footer";
import PostCard from "@/components/blog/PostCard";
import type { Post, Category, SiteSettings, Tag } from "@/types/supabase";
import type { Metadata } from "next";
import { buildItemListJsonLd, buildOpenGraph, buildTwitterCard, buildWebPageJsonLd } from "@/lib/seo";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

interface Props {
    params: Promise<{ slug: string }>;
}

async function getTagData(slug: string) {
    const supabase = createSupabaseAdminClient();

    const [tagRes, settingsRes, categoriesRes, postTagsRes] = await Promise.all([
        supabase.from("tags").select("*").eq("slug", slug).eq("tenant_id", TENANT_ID).single(),
        supabase.from("site_settings").select("*").eq("tenant_id", TENANT_ID).single(),
        supabase.from("categories").select("*").eq("tenant_id", TENANT_ID).order("name"),
        supabase.from("post_tags").select("post_id, tags!inner(slug)").eq("tags.slug", slug),
    ]);

    if (!tagRes.data) return null;

    const postIds = (postTagsRes.data ?? []).map((row: any) => row.post_id).filter(Boolean);
    let posts: Post[] = [];
    if (postIds.length > 0) {
        const { data: postsData } = await supabase
            .from("posts")
            .select("*")
            .in("id", postIds)
            .eq("tenant_id", TENANT_ID)
            .eq("status", "published")
            .order("published_at", { ascending: false });
        posts = (postsData ?? []) as Post[];
    }

    return {
        tag: tagRes.data as Tag,
        posts,
        settings: settingsRes.data as SiteSettings | null,
        categories: (categoriesRes.data ?? []) as Category[],
    };
}

const getCachedTagData = unstable_cache(
    async (slug: string) => getTagData(slug),
    ["tag-page-data", TENANT_ID],
    { revalidate: 300 }
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await getCachedTagData(slug);
    if (!data) return {};

    const siteName = data.settings?.display_title || data.settings?.site_name || "SEO Blog";
    const title = `Tag: ${data.tag.name} | ${siteName}`;
    const description = `Conteúdos marcados com a tag ${data.tag.name}.`;
    const image = data.settings?.default_og_image_url || data.settings?.logo_url || undefined;

    return {
        title,
        description,
        alternates: {
            canonical: `/tag/${slug}`,
        },
        openGraph: buildOpenGraph({
            title,
            description,
            image,
            url: `/tag/${slug}`,
            type: "website",
        }),
        twitter: buildTwitterCard({
            title,
            description,
            image,
        }),
    };
}

export default async function TagPage({ params }: Props) {
    const { slug } = await params;
    const data = await getCachedTagData(slug);
    if (!data) notFound();

    const { tag, posts, settings, categories } = data;
    const siteName = settings?.display_title || settings?.site_name || "SEO Blog";
    const webPageJsonLd = buildWebPageJsonLd({
        title: `Tag: ${tag.name} | ${siteName}`,
        description: `Conteúdos marcados com a tag ${tag.name}.`,
        url: `/tag/${tag.slug}`,
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
                        <h1 className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-500 mb-2">Tag</h1>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                            {tag.name}
                        </h2>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 py-16">
                    {posts.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-100 dark:bg-neutral-900 rounded-3xl">
                            <p className="text-neutral-500">Nenhum post publicado para esta tag.</p>
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
