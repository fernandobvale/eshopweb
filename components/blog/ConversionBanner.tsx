import Link from "next/link";
import type { SiteSettings } from "@/types/supabase";
import clsx from "clsx";

interface Props {
    settings: SiteSettings | null;
    variant?: "home" | "sidebar" | "inline";
    className?: string;
}

function normalizeUrl(url?: string | null) {
    if (!url) return "#";
    return url.trim() || "#";
}

export default function ConversionBanner({ settings, variant = "inline", className }: Props) {
    if (!settings?.banner_active) return null;

    const text = settings.banner_text || "Aumente sua conversao agora!";
    const buttonText = settings.banner_btn_text || "Quero saber mais";
    const buttonUrl = normalizeUrl(settings.banner_btn_url);
    const bgColor = settings.banner_bg_color || "#0f172a";

    if (variant === "sidebar") {
        return (
            <section
                className={clsx(
                    "relative overflow-hidden rounded-2xl border border-white/15 shadow-xl p-5",
                    className
                )}
                style={{ backgroundColor: bgColor }}
                aria-label="Banner de conversao"
            >
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_80%_20%,white,transparent_45%)]" />
                <div className="relative">
                    <div className="aspect-square rounded-xl border border-white/20 bg-black/20 p-5 flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-white/70">Destaque</span>
                        <p className="mt-3 text-white font-extrabold leading-tight text-2xl line-clamp-5">
                            {text}
                        </p>
                        <Link
                            href={buttonUrl}
                            className="mt-auto inline-flex w-full items-center justify-center rounded-lg bg-white text-black font-bold px-4 py-3 text-sm hover:bg-neutral-100 transition"
                        >
                            {buttonText}
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    if (variant === "home") {
        return (
            <section
                className={clsx(
                    "relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl p-8 md:p-10",
                    className
                )}
                style={{ backgroundColor: bgColor }}
                aria-label="Banner de conversao"
            >
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/15 blur-2xl" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-black/25 blur-3xl" />
                <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end">
                    <div>
                        <span className="inline-flex rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                            Recomendado
                        </span>
                        <p className="mt-4 text-white text-2xl md:text-4xl font-black leading-tight max-w-3xl">
                            {text}
                        </p>
                    </div>
                    <Link
                        href={buttonUrl}
                        className="inline-flex items-center justify-center rounded-xl bg-white text-black font-bold px-7 py-4 text-base hover:bg-neutral-100 transition min-w-48"
                    >
                        {buttonText}
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section
            className={clsx(
                "rounded-3xl border border-white/10 shadow-xl overflow-hidden p-8",
                className
            )}
            style={{ backgroundColor: bgColor }}
            aria-label="Banner de conversao"
        >
            <div className="flex gap-6 flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                    <p className="font-bold text-white text-xl md:text-2xl">
                        {text}
                    </p>
                </div>
                <Link
                    href={buttonUrl}
                    className={clsx(
                        "inline-flex items-center justify-center rounded-full bg-white text-black font-bold hover:bg-neutral-100 transition shadow-lg",
                        "px-8 py-4 text-base whitespace-nowrap"
                    )}
                >
                    {buttonText}
                </Link>
            </div>
        </section>
    );
}
