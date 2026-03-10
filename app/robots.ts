import type { MetadataRoute } from "next";

function getBaseUrl() {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
    if (!raw) return "http://localhost:3000";
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export default function robots(): MetadataRoute.Robots {
    const BASE_URL = getBaseUrl();
    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction) {
        return {
            rules: { userAgent: "*", disallow: "/" },
        };
    }

    return {
        rules: [
            { userAgent: "*", allow: "/", disallow: ["/painel", "/acesso", "/login", "/api/"] },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
        host: BASE_URL,
    };
}
