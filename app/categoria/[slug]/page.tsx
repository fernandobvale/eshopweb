import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Header from "@/components/blog/Header";
import Footer from "@/components/blog/Footer";
import PostCard from "@/components/blog/PostCard";
import type { Post, Category, SiteSettings } from "@/types/supabase";
import type { Metadata } from "next";
import { buildItemListJsonLd, buildOpenGraph, buildTwitterCard, buildWebPageJsonLd } from "@/lib/seo";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

interface Props {
    params: Promise<{ slug: string }>;
}

async function getCategoryData(slug: string) {
    const supabase = createSupabaseAdminClient();

    const [catRes, settingsRes, allCategoriesRes] = await Promise.all([
        supabase.from("categories").select("*").eq("slug", slug).eq("tenant_id", TENANT_ID).single(),
        supabase.from("site_settings").select("*").eq("tenant_id", TENANT_ID).single(),
        supabase.from("categories").select("*").eq("tenant_id", TENANT_ID).order("name"),
    ]);

    if (!catRes.data) return null;

    const catData = catRes.data as any;
    const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("tenant_id", TENANT_ID)
        .eq("category_id", catData.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });

    return {
        category: catRes.data as Category,
        posts: (posts ?? []) as Post[],
        settings: settingsRes.data as SiteSettings | null,
        categories: (allCategoriesRes.data ?? []) as Category[],
    };
}

const getCachedCategoryData = unstable_cache(
    async (slug: string) => getCategoryData(slug),
    ["category-page-data", TENANT_ID],
    { revalidate: 300 }
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await getCachedCategoryData(slug);
    if (!data) return {};

    const title = `${data.category.name} | ${data.settings?.site_name || "Blog"}`;
    const description = data.category.description || undefined;
    const image = data.settings?.default_og_image_url || data.settings?.logo_url || undefined;

    return {
        title,
        description,
        alternates: {
            canonical: `/categoria/${slug}`,
        },
        openGraph: buildOpenGraph({
            title,
            description,
            image,
            url: `/categoria/${slug}`,
            type: "website",
        }),
        twitter: buildTwitterCard({
            title,
            description,
            image,
        }),
    };
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const data = await getCachedCategoryData(slug);
    if (!data) notFound();

    const { category, posts, settings, categories } = data;
    const siteName = settings?.display_title || settings?.site_name || "SEO Blog";
    const webPageJsonLd = buildWebPageJsonLd({
        title: `${category.name} | ${siteName}`,
        description: category.description || undefined,
        url: `/categoria/${category.slug}`,
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
                        <h1 className="text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-brand-500 mb-2">Categoria</h1>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                            {category.name}
                        </h2>
                        {category.description && (
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-4 max-w-2xl">
                                {category.description}
                            </p>
                        )}
                    </div>
                </section>

                <section className="max-w-6xl mx-auto px-4 py-16">
                    {posts.length === 0 ? (
                        <div className="text-center py-20 bg-neutral-100 dark:bg-neutral-900 rounded-3xl">
                            <p className="text-neutral-500">Nenhum post encontrado nesta categoria.</p>
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
