import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import type { Post, Profile, Category, Tag, SiteSettings } from "@/types/supabase";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/blog/Header";
import Footer from "@/components/blog/Footer";
import ConversionBanner from "@/components/blog/ConversionBanner";
import type { Metadata } from "next";
import { buildOpenGraph, buildArticleJsonLd, buildBreadcrumbJsonLd, buildTwitterCard } from "@/lib/seo";
import AuthorCard from "@/components/blog/AuthorCard";
import clsx from "clsx";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getPageData(slug: string) {
    const supabase = createSupabaseAdminClient();

    const [postRes, settingsRes, categoriesRes] = await Promise.all([
        supabase
            .from("posts")
            .select("*")
            .eq("slug", slug)
            .eq("tenant_id", TENANT_ID)
            .eq("status", "published")
            .single(),
        supabase.from("site_settings").select("*").eq("tenant_id", TENANT_ID).single(),
        supabase.from("categories").select("*").eq("tenant_id", TENANT_ID).order("name"),
    ]);

    if (!postRes.data) return null;

    const post = postRes.data as Post;

    const authorId = post.author_id || settingsRes.data?.main_author_id;
    const [authorRes, categoryRes, tagsRes] = await Promise.all([
        authorId
            ? supabase.from("profiles").select("*").eq("id", authorId).single()
            : Promise.resolve({ data: null, error: null } as any),
        post.category_id
            ? supabase.from("categories").select("*").eq("id", post.category_id).single()
            : Promise.resolve({ data: null }),
        supabase.from("post_tags").select("tags(*)").eq("post_id", post.id),
    ]);

    return {
        post,
        settings: settingsRes.data as SiteSettings | null,
        categories: (categoriesRes.data ?? []) as Category[],
        author: authorRes.data as Partial<Profile> | null,
        category: categoryRes.data as Partial<Category> | null,
        tags: (tagsRes.data ?? []).flatMap((pt: any) => pt.tags ? [pt.tags as Tag] : []),
    };
}

const getCachedPageData = unstable_cache(
    async (slug: string) => getPageData(slug),
    ["post-page-data", TENANT_ID],
    { revalidate: 300 }
);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = await getCachedPageData(slug);
    if (!result) return {};

    const { post, author } = result;
    const title = post.seo_title || post.title;
    const description = post.seo_description || post.excerpt || undefined;
    const image = post.og_image_url || post.cover_image_url || undefined;

    return {
        title,
        description,
        alternates: {
            canonical: post.canonical_url || `/${slug}`,
        },
        openGraph: buildOpenGraph({ title, description, image, url: `/${slug}`, type: "article" }),
        twitter: buildTwitterCard({ title, description, image }),
        authors: author?.full_name ? [{ name: author.full_name }] : undefined,
    };
}

export default async function PostPage({ params }: PageProps) {
    const { slug } = await params;
    const result = await getCachedPageData(slug);
    if (!result) notFound();

    const { post, author, category, tags, settings, categories } = result;
    const siteName = settings?.display_title || settings?.site_name || "SEO Blog";

    const articleJsonLd = buildArticleJsonLd({
        title: post.seo_title || post.title,
        description: post.seo_description || post.excerpt || undefined,
        image: post.og_image_url || post.cover_image_url || undefined,
        url: `/${slug}`,
        datePublished: post.published_at!,
        dateModified: post.updated_at,
        authorName: author?.full_name || undefined,
        publisherLogo: settings?.logo_url || undefined,
    });

    const breadcrumbJsonLd = buildBreadcrumbJsonLd([
        { name: "Home", url: "/" },
        ...(category ? [{ name: category.name!, url: `/categoria/${category.slug}` }] : []),
        { name: post.title, url: `/${slug}` },
    ]);

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <Header
                siteName={siteName}
                categories={categories}
                logoUrl={settings?.logo_url}
                isAuthenticated={false}
                urlAbout={settings?.url_about}
                urlContact={settings?.url_contact}
            />

            <main className={clsx(
                "flex-1 mx-auto px-4 py-16 w-full",
                settings?.article_layout === "narrow" ? "max-w-3xl" :
                    settings?.article_layout === "full" ? "max-w-7xl" : "max-w-6xl"
            )}>
                <div className={clsx(
                    "w-full",
                    settings?.article_layout === "narrow" ? "" : "lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10"
                )}>
                    <article>
                        {/* Breadcrumb breadcrumb UI */}
                        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 mb-8 overflow-hidden whitespace-nowrap">
                            <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
                            <span>/</span>
                            {category && (
                                <>
                                    <Link href={`/categoria/${category.slug}`} className="hover:text-brand-500 transition-colors">{category.name}</Link>
                                    <span>/</span>
                                </>
                            )}
                            <span className="text-neutral-300 dark:text-neutral-600 truncate">{post.title}</span>
                        </nav>

                        <header className="mb-12">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white leading-[1.1] mb-6 tracking-tight">
                                {post.title}
                            </h1>

                            {post.excerpt && (
                                <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed font-medium">
                                    {post.excerpt}
                                </p>
                            )}

                            <div className="flex items-center gap-6 text-sm">
                                {author?.avatar_url && (
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800">
                                        <Image src={author.avatar_url} alt={author.full_name || ""} fill className="object-cover" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-neutral-900 dark:text-white">{author?.full_name || "Equipe"}</p>
                                    <div className="flex items-center gap-2 text-neutral-500 text-xs">
                                        <time dateTime={post.published_at!}>
                                            {new Date(post.published_at!).toLocaleDateString("pt-BR", { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </time>
                                        <span className="w-1 h-1 bg-neutral-300 rounded-full" />
                                        <span>{post.reading_time_minutes || 5} min leitura</span>
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Cover */}
                        {post.cover_image_url && (
                            <div className="relative aspect-[21/9] rounded-3xl overflow-hidden mb-16 shadow-2xl">
                                <Image
                                    src={post.cover_image_url}
                                    alt={post.title}
                                    fill
                                    priority
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 1024px"
                                />
                            </div>
                        )}
                        {settings?.article_layout === "narrow" && (
                            <ConversionBanner settings={settings} variant="inline" className="mb-12" />
                        )}

                        {/* Body */}
                        <div
                            className="prose prose-lg dark:prose-invert max-w-none 
                       prose-headings:tracking-tight prose-headings:font-extrabold 
                       prose-p:leading-relaxed prose-p:text-neutral-700 dark:prose-p:text-neutral-300
                       prose-a:text-brand-600 dark:prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline
                       prose-img:rounded-3xl prose-img:shadow-lg"
                            dangerouslySetInnerHTML={{ __html: post.content || "" }}
                        />

                        {/* Tags */}
                        {tags.length > 0 && (
                            <footer className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-900">
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag: Tag) => (
                                        <Link
                                            key={tag.id}
                                            href={`/tag/${tag.slug}`}
                                            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-900 hover:bg-brand-50 dark:hover:bg-brand-900/20 text-neutral-700 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-500 rounded-full text-xs font-bold transition-colors border border-transparent hover:border-brand-200 dark:hover:border-brand-900"
                                        >
                                            #{tag.name}
                                        </Link>
                                    ))}
                                </div>
                            </footer>
                        )}
                    </article>

                    {settings?.article_layout !== "narrow" && (
                        <aside className="hidden lg:block">
                            <div className="sticky top-24 space-y-8">
                                <AuthorCard author={author as any} />
                                <ConversionBanner settings={settings} variant="sidebar" />
                            </div>
                        </aside>
                    )}
                </div>
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
