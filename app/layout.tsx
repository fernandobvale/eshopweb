import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/supabase";
import { ToastProvider } from "@/components/ui/Toast";
import Script from "next/script";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const revalidate = 300;

function getMetadataBaseUrl() {
    const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
    const candidate = raw
        ? /^https?:\/\//i.test(raw)
            ? raw
            : `https://${raw}`
        : "http://localhost:3000";

    try {
        return new URL(candidate);
    } catch {
        return new URL("http://localhost:3000");
    }
}

export const metadata: Metadata = {
    title: {
        default: process.env.NEXT_PUBLIC_SITE_NAME ?? "SEO Blog",
        template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME ?? "SEO Blog"}`,
    },
    description: "A modern, SEO-first blog platform.",
    metadataBase: getMetadataBaseUrl(),
    openGraph: {
        type: "website",
        locale: "pt_BR",
        siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "SEO Blog",
    },
    twitter: {
        card: "summary_large_image",
    },
    referrer: "origin-when-cross-origin",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
};
export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from("site_settings")
        .select("*")
        .eq("tenant_id", TENANT_ID)
        .maybeSingle();
    const settings = data as SiteSettings | null;
    const faviconHref = settings?.favicon_url
        ? settings.favicon_url.startsWith("data:")
            ? settings.favicon_url
            : `${settings.favicon_url}${settings.favicon_url.includes("?") ? "&" : "?"}v=${encodeURIComponent(settings.updated_at || "")}`
        : null;
    const faviconType = settings?.favicon_url?.endsWith(".svg") ? "image/svg+xml" : undefined;

    return (
        <html lang="pt-BR" suppressHydrationWarning className={inter.variable}>
            <head>
                {faviconHref && (
                    <>
                        <link rel="icon" href={faviconHref} type={faviconType} />
                        <link rel="shortcut icon" href={faviconHref} type={faviconType} />
                        <link rel="apple-touch-icon" href={faviconHref} />
                    </>
                )}
                {settings?.google_site_verification && (
                    <meta
                        name="google-site-verification"
                        content={settings.google_site_verification}
                    />
                )}

                {/* Google Analytics 4 (gtag.js) */}
                {settings?.google_analytics_id && (
                    <>
                        <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`} strategy="afterInteractive" />
                        <Script
                            id="ga4-init"
                            strategy="afterInteractive"
                            dangerouslySetInnerHTML={{
                                __html: `
                                    window.dataLayer = window.dataLayer || [];
                                    function gtag(){dataLayer.push(arguments);}
                                    gtag('js', new Date());
                                    gtag('config', '${settings.google_analytics_id}', {
                                        page_path: window.location.pathname,
                                    });
                                `
                            }}
                        />
                    </>
                )}

                {/* Google Tag Manager */}
                {settings?.gtm_id && (
                    <Script
                        id="gtm-init"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                            })(window,document,'script','dataLayer','${settings.gtm_id}');`
                        }}
                    />
                )}

                {/* Facebook Pixel */}
                {settings?.facebook_pixel_id && (
                    <Script
                        id="fb-pixel-init"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
                            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                            document,'script','https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${settings.facebook_pixel_id}');fbq('track', 'PageView');`
                        }}
                    />
                )}
                {settings?.custom_css && <style dangerouslySetInnerHTML={{ __html: settings.custom_css }} />}
                {settings?.custom_header_js && <script dangerouslySetInnerHTML={{ __html: settings.custom_header_js }} />}
            </head>
            <body>
                <ToastProvider>
                    {settings?.gtm_id && (
                        <noscript>
                            <iframe
                                src={`https://www.googletagmanager.com/ns.html?id=${settings.gtm_id}`}
                                height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}
                            />
                        </noscript>
                    )}
                    {children}
                </ToastProvider>
            </body>
        </html>
    );
}
