import Link from "next/link";

interface Props {
    siteName: string;
    logoUrl?: string | null;
    footerText?: string | null;
    siteDescription?: string | null;
    urlAbout?: string | null;
    urlContact?: string | null;
    urlPrivacy?: string | null;
    urlTerms?: string | null;
}

export default function BlogFooter({
    siteName,
    logoUrl,
    footerText,
    siteDescription,
    urlAbout = "/quem-somos",
    urlContact = "/contato",
    urlPrivacy = "/privacidade",
    urlTerms = "/termos"
}: Props) {
    const defaultCopyright = `© ${new Date().getFullYear()} ${siteName}. Todos os direitos reservados.`;
    const copyrightText = (footerText || "").trim() || defaultCopyright;

    return (
        <footer className="bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-4">
                        {logoUrl ? (
                            <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
                        ) : (
                            <h3 className="font-bold text-lg dark:text-white">{siteName}</h3>
                        )}
                        <p className="text-sm text-neutral-500 max-w-xs">
                            {siteDescription || "Sua plataforma de conteúdo especializada em SEO e performance."}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider dark:text-neutral-400">Links Rápidos</h4>
                        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-500">
                            <li><Link href="/" className="hover:text-brand-500">Home</Link></li>
                            <li><Link href="/sitemap.xml" className="hover:text-brand-500">Sitemap</Link></li>
                            <li><Link href="/llm.txt" className="hover:text-brand-500">LLM Documentation</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm uppercase tracking-wider dark:text-neutral-400">Legal</h4>
                        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-500">
                            <li><Link href={urlAbout || "/quem-somos"} className="hover:text-brand-500">Quem Somos</Link></li>
                            <li><Link href={urlContact || "/contato"} className="hover:text-brand-500">Contato</Link></li>
                            <li><Link href={urlPrivacy || "/privacidade"} className="hover:text-brand-500">Privacidade</Link></li>
                            <li><Link href={urlTerms || "/termos"} className="hover:text-brand-500">Termos de Uso</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-neutral-200 dark:border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
                    <p>{copyrightText}</p>
                </div>
            </div>
        </footer>
    );
}
