import { createSupabaseAdminClient } from "@/lib/supabase/server";
import Header from "@/components/blog/Header";
import Footer from "@/components/blog/Footer";
import type { Category, SiteSettings } from "@/types/supabase";
import type { Metadata } from "next";
import { buildContactHtml } from "@/lib/legal-pages";
import { getSession } from "@/lib/session";
import { buildOpenGraph, buildTwitterCard, buildWebPageJsonLd } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("site_settings").select("*").single();
    const settings = data as SiteSettings | null;
    const siteName = settings?.display_title || settings?.site_name || "SEO Blog";
    const title = `Contato | ${siteName}`;
    const description = `Canal de contato oficial do ${siteName}.`;
    const image = settings?.default_og_image_url || settings?.logo_url || undefined;

    return {
        title,
        description,
        alternates: {
            canonical: "/contato",
        },
        openGraph: buildOpenGraph({
            title,
            description,
            image,
            url: "/contato",
            type: "website",
        }),
        twitter: buildTwitterCard({
            title,
            description,
            image,
        }),
    };
}

export default async function ContactPage() {
    const supabase = createSupabaseAdminClient();
    const session = await getSession();
    const [settingsRes, categoriesRes, pageRes] = await Promise.all([
        supabase.from("site_settings").select("*").single(),
        supabase.from("categories").select("*").order("name"),
        supabase.from("pages").select("*").eq("slug", "contato").eq("status", "published").maybeSingle(),
    ]);

    const settings = settingsRes.data as SiteSettings | null;
    const categories = (categoriesRes.data ?? []) as Category[];
    const siteName = settings?.display_title || settings?.site_name || "SEO Blog";
    const defaultContent = buildContactHtml({
        blogName: settings?.site_name || siteName,
        contactEmail: "contato@exemplo.com",
    });
    const content = (pageRes.data as any)?.content || defaultContent;
    const webPageJsonLd = buildWebPageJsonLd({
        title: `Contato | ${siteName}`,
        description: `Canal de contato oficial do ${siteName}.`,
        url: "/contato",
    });

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
            <Header siteName={siteName} categories={categories} logoUrl={settings?.logo_url} isAuthenticated={!!session.user} />
            <main className="flex-1 max-w-4xl mx-auto px-4 py-16 w-full">
                <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:tracking-tight prose-headings:font-extrabold prose-p:leading-relaxed prose-p:text-neutral-700 dark:prose-p:text-neutral-300 prose-a:text-brand-600 dark:prose-a:text-brand-500 prose-a:no-underline hover:prose-a:underline prose-ul:pl-6">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </article>
            </main>
            <Footer
                siteName={siteName}
                logoUrl={settings?.logo_url}
                footerText={settings?.footer_text}
                siteDescription={settings?.display_subtitle || settings?.site_description}
            />
        </div>
    );
}
