import slugify from "slugify";

/**
 * Generate a URL-safe slug from a text string.
 */
export function toSlug(text: string): string {
    return slugify(text, {
        lower: true,
        strict: true,
        locale: "pt",
    });
}

interface SeoProps {
    title: string;
    description?: string;
    image?: string;
    url?: string;
    type?: "website" | "article";
}

function getNormalizedSiteUrl(): string {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, "");
    return `https://${raw.replace(/\/$/, "")}`;
}

function toAbsoluteUrl(input?: string): string | undefined {
    if (!input) return undefined;
    if (/^https?:\/\//i.test(input)) return input;
    const siteUrl = getNormalizedSiteUrl();
    if (!siteUrl) return input;
    const path = input.startsWith("/") ? input : `/${input}`;
    return `${siteUrl}${path}`;
}

/**
 * Build Open Graph metadata object compatible with Next.js Metadata API.
 */
export function buildOpenGraph({ title, description, image, url, type = "website" }: SeoProps) {
    const siteUrl = getNormalizedSiteUrl();
    const normalizedUrl = toAbsoluteUrl(url) ?? siteUrl;
    const normalizedImage = toAbsoluteUrl(image);
    return {
        title,
        description,
        url: normalizedUrl,
        images: normalizedImage ? [{ url: normalizedImage, width: 1200, height: 630, alt: title }] : [],
        siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "SEO Blog",
        type,
    };
}

export function buildTwitterCard({ title, description, image }: Pick<SeoProps, "title" | "description" | "image">) {
    const normalizedImage = toAbsoluteUrl(image);
    return {
        card: "summary_large_image" as const,
        title,
        description,
        images: normalizedImage ? [normalizedImage] : undefined,
    };
}

/**
 * Build Article JSON-LD structured data.
 */
export function buildArticleJsonLd({
    title,
    description,
    image,
    url,
    datePublished,
    dateModified,
    authorName,
    publisherLogo,
}: SeoProps & {
    datePublished: string;
    dateModified?: string;
    authorName?: string;
    publisherLogo?: string;
}) {
    const siteUrl = getNormalizedSiteUrl();
    const normalizedUrl = toAbsoluteUrl(url) ?? siteUrl;
    const normalizedImage = toAbsoluteUrl(image);
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        image: normalizedImage,
        url: normalizedUrl,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": normalizedUrl,
        },
        datePublished,
        dateModified: dateModified ?? datePublished,
        author: authorName
            ? { "@type": "Person", name: authorName }
            : undefined,
        publisher: {
            "@type": "Organization",
            name: process.env.NEXT_PUBLIC_SITE_NAME ?? "SEO Blog",
            url: siteUrl,
            logo: toAbsoluteUrl(publisherLogo)
                ? {
                    "@type": "ImageObject",
                    url: toAbsoluteUrl(publisherLogo),
                }
                : undefined,
        },
    };
}

/**
 * Build BreadcrumbList JSON-LD.
 */
export function buildBreadcrumbJsonLd(
    items: Array<{ name: string; url: string }>
) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: toAbsoluteUrl(item.url),
        })),
    };
}

export function buildWebPageJsonLd({
    title,
    description,
    url,
}: {
    title: string;
    description?: string;
    url: string;
}) {
    const normalizedUrl = toAbsoluteUrl(url);
    return {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        description,
        url: normalizedUrl,
    };
}

export function buildItemListJsonLd(items: Array<{ name: string; url: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: toAbsoluteUrl(item.url),
        })),
    };
}

export function buildWebSiteJsonLd({
    description,
}: {
    description?: string;
} = {}) {
    const siteUrl = getNormalizedSiteUrl();
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: process.env.NEXT_PUBLIC_SITE_NAME ?? "SEO Blog",
        url: siteUrl,
        description,
    };
}

export function buildOrganizationJsonLd({
    name,
    description,
    logo,
    socialUrls = [],
}: {
    name: string;
    description?: string;
    logo?: string;
    socialUrls?: Array<string | null | undefined>;
}) {
    const siteUrl = getNormalizedSiteUrl();
    const sameAs = socialUrls.filter((url): url is string => Boolean(url));
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        description,
        url: siteUrl,
        logo: toAbsoluteUrl(logo),
        sameAs: sameAs.length > 0 ? sameAs : undefined,
    };
}
