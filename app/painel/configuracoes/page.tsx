"use client";

import { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    Palette,
    Search,
    Megaphone,
    FileText,
    Upload,
    Database,
    Save,
    Plus,
    RefreshCw,
    Globe,
    Sparkles,
    Shield,
    Rocket,
    BookOpen,
    PenTool,
    TrendingUp,
    Bot
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import clsx from "clsx";
import { buildAboutUsHtml, buildContactHtml, buildPrivacyPolicyHtml, buildTermsOfUseHtml } from "@/lib/legal-pages";
import FeedbackModal from "@/components/ui/FeedbackModal";

type Tab = "identity" | "appearance" | "seo" | "banners" | "pages" | "import" | "system";

export default function SettingsPage() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<Tab>("identity");
    const [settings, setSettings] = useState<any>(null);
    const [pages, setPages] = useState<any[]>([]);
    const [legalBlogName, setLegalBlogName] = useState("");
    const [legalContactEmail, setLegalContactEmail] = useState("contato@exemplo.com");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);
    const [applyingFaviconIcon, setApplyingFaviconIcon] = useState(false);
    const [testingDb, setTestingDb] = useState(false);
    const [testingLocalAuth, setTestingLocalAuth] = useState(false);
    const [faviconMode, setFaviconMode] = useState<"upload" | "library">("upload");
    const [selectedFaviconIcon, setSelectedFaviconIcon] = useState("globe");
    const [faviconIconColor, setFaviconIconColor] = useState("#0f172a");
    const [importFeedback, setImportFeedback] = useState<{
        title: string;
        message: string;
        type: "success" | "error";
    } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [settingsRes, pagesRes] = await Promise.all([
                fetch("/api/admin/settings"),
                fetch("/api/admin/pages")
            ]);

            if (settingsRes.ok) {
                const sJson = await settingsRes.json();
                setSettings(sJson.data);
                // Pré-preenche os estados locais com os dados do banco
                setLegalBlogName(sJson.data?.legal_blog_name || sJson.data?.site_name || sJson.data?.display_title || "");
                setLegalContactEmail(sJson.data?.legal_contact_email || "contato@exemplo.com");
            }
            if (pagesRes.ok) {
                const pJson = await pagesRes.json();
                setPages(pJson.data);
            }
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings)
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(result?.error || "Falha ao salvar configurações");
            }
            setSettings(result?.data ?? settings);
            toast("Configurações salvas com sucesso!");
            await fetchData();
        } catch (error) {
            toast(error instanceof Error ? error.message : "Erro ao salvar configurações", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleTestDbConnection = async () => {
        setTestingDb(true);
        try {
            const res = await fetch("/api/admin/system/test-db");
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json?.ok) {
                throw new Error(json?.error || "Não foi possível testar a conexão com o banco.");
            }
            toast(json?.message || "Conexão com o banco OK.");
        } catch (error) {
            toast(error instanceof Error ? error.message : "Erro ao testar conexão com o banco.", "error");
        } finally {
            setTestingDb(false);
        }
    };

    const handleTestLocalAuth = async () => {
        setTestingLocalAuth(true);
        try {
            const res = await fetch("/api/admin/system/test-local-auth");
            const json = await res.json().catch(() => ({}));
            if (!res.ok || !json?.ok) {
                throw new Error(json?.error || "Não foi possível validar a autenticação local.");
            }
            toast(json?.message || "Autenticação local configurada corretamente.");
        } catch (error) {
            toast(error instanceof Error ? error.message : "Erro ao validar autenticação local.", "error");
        } finally {
            setTestingLocalAuth(false);
        }
    };

    const handleImportXML = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/import/wordpress", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setImportFeedback({
                    title: "Importação concluída",
                    message: `${data.importedCount} post(s) importado(s) com sucesso.`,
                    type: "success",
                });
                fetchData();
            } else {
                setImportFeedback({
                    title: "Erro na importação",
                    message: data.error || "Não foi possível processar o arquivo XML.",
                    type: "error",
                });
            }
        } catch (error) {
            setImportFeedback({
                title: "Erro de conexão",
                message: "Não foi possível conectar com o servidor durante a importação.",
                type: "error",
            });
        } finally {
            setSaving(false);
            e.target.value = "";
        }
    };

    const FAVICON_ICON_OPTIONS = [
        { id: "globe", label: "Globo", icon: Globe },
        { id: "sparkles", label: "Sparkles", icon: Sparkles },
        { id: "shield", label: "Shield", icon: Shield },
        { id: "rocket", label: "Rocket", icon: Rocket },
        { id: "book-open", label: "Book", icon: BookOpen },
        { id: "pen-tool", label: "Pen", icon: PenTool },
        { id: "trending-up", label: "Trend", icon: TrendingUp },
        { id: "bot", label: "Bot", icon: Bot },
    ];

    function buildFaviconSvg(iconId: string, color: string) {
        const pathsByIcon: Record<string, string> = {
            globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/>`,
            sparkles: `<path d="m12 3 1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z"/><path d="M5 17l.8 1.8L7.6 20l-1.8.8L5 22l-.8-1.2L2.4 20l1.8-1.2L5 17z"/><path d="M19 15l.9 2L22 18l-2.1 1L19 21l-.9-2-2.1-1 2.1-1 .9-2z"/>`,
            shield: `<path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z"/><path d="m9 12 2 2 4-4"/>`,
            rocket: `<path d="M5 15c0-4 6-10 12-10 0 6-6 12-10 12"/><path d="M9 15l-2 6 6-2"/><circle cx="14.5" cy="9.5" r="1.5"/>`,
            "book-open": `<path d="M12 6v15"/><path d="M5 7.5C7.5 6 10 6 12 7.2c2-1.2 4.5-1.2 7 0V20c-2.5-1.2-5-1.2-7 0-2-1.2-4.5-1.2-7 0V7.5z"/>`,
            "pen-tool": `<path d="m3 21 6-6"/><path d="m15 3 6 6"/><path d="M8 16 3 8l5-5 8 5-8 8z"/><circle cx="17" cy="17" r="3"/>`,
            "trending-up": `<path d="M3 17h6l3-4 3 2 6-8"/><path d="M17 7h4v4"/>`,
            bot: `<rect x="5" y="8" width="14" height="10" rx="3"/><path d="M12 4v4"/><circle cx="10" cy="13" r="1"/><circle cx="14" cy="13" r="1"/><path d="M9 16h6"/>`,
        };

        const content = pathsByIcon[iconId];
        if (!content) return null;

        return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
    }

    const persistSettings = async (nextSettings: any) => {
        const saveRes = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nextSettings),
        });
        const saved = await saveRes.json().catch(() => ({}));
        if (!saveRes.ok) {
            throw new Error(saved?.error || "Erro ao salvar configurações");
        }
        setSettings(saved?.data ?? nextSettings);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt_text", "Logo do site");

        try {
            const res = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Erro ao enviar logo");
            }
            const updatedSettings = { ...settings, logo_url: data.data.url };
            await persistSettings(updatedSettings);
            toast("Logo enviada e aplicada com sucesso.");
        } catch (error) {
            toast(error instanceof Error ? error.message : "Erro ao enviar logo", "error");
        } finally {
            setUploadingLogo(false);
            e.target.value = "";
        }
    };

    const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("Iniciando upload de favicon:", file.name);
        setUploadingFavicon(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt_text", "Favicon do site");

        try {
            const res = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Erro ao enviar favicon");
            }
            const updatedSettings = { ...settings, favicon_url: data.data.url };
            await persistSettings(updatedSettings);
            toast("Ícone do site enviado e aplicado com sucesso.");
        } catch (error) {
            toast(error instanceof Error ? error.message : "Erro ao enviar favicon", "error");
        } finally {
            setUploadingFavicon(false);
            e.target.value = "";
        }
    };

    const handleApplyFaviconFromLibrary = async () => {
        const faviconSvg = buildFaviconSvg(selectedFaviconIcon, faviconIconColor);
        if (!faviconSvg) {
            toast("Não foi possível gerar o ícone selecionado.", "error");
            return;
        }
        setApplyingFaviconIcon(true);
        try {
            const fileName = `favicon-${selectedFaviconIcon}.svg`;
            const file = new File([faviconSvg], fileName, { type: "image/svg+xml" });
            const formData = new FormData();
            formData.append("file", file);
            formData.append("alt_text", "Favicon do site");

            const uploadRes = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            });
            const uploadData = await uploadRes.json().catch(() => ({}));
            if (!uploadRes.ok) {
                throw new Error(uploadData?.error || "Erro ao enviar ícone da biblioteca");
            }

            const updatedSettings = { ...settings, favicon_url: uploadData.data.url };
            await persistSettings(updatedSettings);
            toast("Ícone da biblioteca aplicado com sucesso.");
        } catch (error) {
            toast(error instanceof Error ? error.message : "Erro ao aplicar ícone", "error");
        } finally {
            setApplyingFaviconIcon(false);
        }
    };

    const upsertInstitutionalPage = async (page: { title: string; slug: string; content: string }) => {
        const candidateSlugs =
            page.slug === "termos"
                ? ["termos", "termos-de-uso"]
                : [page.slug];

        const existingPage = pages.find((item) => candidateSlugs.includes(item.slug));
        const hasValidId = existingPage && existingPage.id && existingPage.id !== "undefined";

        const endpoint = hasValidId ? `/api/admin/pages/${existingPage.id}` : "/api/admin/pages";
        const method = hasValidId ? "PUT" : "POST";

        const payload = { ...page, status: "published" };
        const res = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(json?.error || `Falha ao salvar página ${page.slug}`);
        }
    };

    const handleCreatePage = async (pageType: "privacy" | "terms" | "about" | "contact" | "all") => {
        const blogName = legalBlogName.trim() || settings?.legal_blog_name || settings?.site_name || "Meu Blog";
        const contactEmail = legalContactEmail.trim() || settings?.legal_contact_email || "contato@exemplo.com";
        const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);
        if (!emailIsValid) {
            toast("Informe um e-mail de contato válido.", "error");
            return;
        }

        setSaving(true);
        try {
            // Salva as informações legais nos settings primeiro para garantir persistência
            const settingsRes = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // Não enviamos o settings inteiro para evitar sobrescrever campos indesejados
                    // ou enviar IDs vazios
                    legal_blog_name: blogName,
                    legal_contact_email: contactEmail
                })
            });
            const settingsJson = await settingsRes.json().catch(() => ({}));
            if (!settingsRes.ok) {
                throw new Error(settingsJson?.error || "Não foi possível atualizar as informações legais");
            }
            const updatedSettings = settingsJson?.data ?? settings;
            setSettings(updatedSettings);
            // Atualiza estados locais com o que veio do banco
            setLegalBlogName(updatedSettings.legal_blog_name || blogName);
            setLegalContactEmail(updatedSettings.legal_contact_email || contactEmail);

            const finalBlogName = updatedSettings.legal_blog_name || blogName;
            const finalContactEmail = updatedSettings.legal_contact_email || contactEmail;

            const templates = {
                privacy: {
                    title: "Política de Privacidade",
                    slug: "privacidade",
                    content: buildPrivacyPolicyHtml({
                        blogName: finalBlogName,
                        contactEmail: finalContactEmail
                    })
                },
                terms: {
                    title: "Termos de Uso",
                    slug: "termos",
                    content: buildTermsOfUseHtml({
                        blogName: finalBlogName,
                        contactEmail: finalContactEmail
                    })
                },
                about: {
                    title: "Quem Somos",
                    slug: "quem-somos",
                    content: buildAboutUsHtml({
                        blogName: finalBlogName,
                        contactEmail: finalContactEmail
                    })
                },
                contact: {
                    title: "Contato",
                    slug: "contato",
                    content: buildContactHtml({
                        blogName: finalBlogName,
                        contactEmail: finalContactEmail
                    })
                }
            };

            if (pageType === "all") {
                await upsertInstitutionalPage(templates.privacy);
                await upsertInstitutionalPage(templates.terms);
                await upsertInstitutionalPage(templates.about);
                await upsertInstitutionalPage(templates.contact);
            } else if (pageType === "privacy") {
                await upsertInstitutionalPage(templates.privacy);
            } else if (pageType === "terms") {
                await upsertInstitutionalPage(templates.terms);
            } else if (pageType === "about") {
                await upsertInstitutionalPage(templates.about);
            } else {
                await upsertInstitutionalPage(templates.contact);
            }

            await fetchData();
            toast("Páginas institucionais atualizadas com sucesso!");
        } catch (error) {
            toast(error instanceof Error ? error.message : "Erro ao criar página", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Configurações do Blog</h1>
                <p className="text-neutral-400">Gerencie a identidade, aparência e funcionalidades globais do seu CMS.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Tabs Sidebar */}
                <aside className="w-full md:w-64 space-y-1">
                    <TabButton
                        active={activeTab === "identity"}
                        onClick={() => setActiveTab("identity")}
                        icon={SettingsIcon}
                        label="Identidade Visual"
                    />
                    <TabButton
                        active={activeTab === "appearance"}
                        onClick={() => setActiveTab("appearance")}
                        icon={Palette}
                        label="Aparência"
                    />
                    <TabButton
                        active={activeTab === "seo"}
                        onClick={() => setActiveTab("seo")}
                        icon={Search}
                        label="SEO & Analytics"
                    />
                    <TabButton
                        active={activeTab === "banners"}
                        onClick={() => setActiveTab("banners")}
                        icon={Megaphone}
                        label="Banners de Artigo"
                    />
                    <TabButton
                        active={activeTab === "pages"}
                        onClick={() => setActiveTab("pages")}
                        icon={FileText}
                        label="Páginas Legais"
                    />
                    <TabButton
                        active={activeTab === "import"}
                        onClick={() => setActiveTab("import")}
                        icon={Upload}
                        label="Importar WordPress"
                    />
                    <TabButton
                        active={activeTab === "system"}
                        onClick={() => setActiveTab("system")}
                        icon={Database}
                        label="Sistema & API"
                    />
                </aside>

                {/* Content Area */}
                <div className="flex-1 bg-neutral-800/50 border border-neutral-700 rounded-xl p-6">
                    {activeTab === "identity" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4 text-brand-400">Identidade Visual</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <InputField
                                    label="Título do Site"
                                    value={settings?.display_title || ""}
                                    onChange={(v) => setSettings({ ...settings, display_title: v })}
                                />
                                <InputField
                                    label="Subtítulo / Descrição"
                                    value={settings?.display_subtitle || ""}
                                    onChange={(v) => setSettings({ ...settings, display_subtitle: v })}
                                />
                                <InputField
                                    label="Texto do Rodapé"
                                    value={settings?.footer_text || ""}
                                    onChange={(v) => setSettings({ ...settings, footer_text: v })}
                                />
                                <div className="rounded-xl border border-neutral-700 bg-neutral-900/40 p-4">
                                    <p className="text-sm font-medium text-neutral-300 mb-3">Logo do Site</p>
                                    {settings?.logo_url ? (
                                        <div className="space-y-3">
                                            <div className="rounded-lg border border-neutral-700 bg-neutral-950 p-3">
                                                <img
                                                    src={settings.logo_url}
                                                    alt="Logo atual"
                                                    className="h-14 w-auto object-contain"
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <label className={clsx(
                                                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                                                    uploadingLogo
                                                        ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                                        : "bg-brand-600 hover:bg-brand-700 text-white"
                                                )}>
                                                    {uploadingLogo ? "Enviando..." : "Trocar Logo"}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploadingLogo}
                                                        onChange={handleLogoUpload}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setSettings({ ...settings, logo_url: null })}
                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-900/20 hover:bg-red-900/30 text-red-300 border border-red-900/50 transition-colors"
                                                >
                                                    Remover Logo
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className={clsx(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                                            uploadingLogo
                                                ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                                : "bg-brand-600 hover:bg-brand-700 text-white"
                                        )}>
                                            {uploadingLogo ? "Enviando..." : "Subir Logo"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploadingLogo}
                                                onChange={handleLogoUpload}
                                            />
                                        </label>
                                    )}
                                </div>

                                <div className="rounded-xl border border-neutral-700 bg-neutral-900/40 p-4 space-y-4">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-300">Ícone do Site (Favicon)</p>
                                        <p className="text-xs text-neutral-500 mt-1">Escolha entre subir uma imagem ou gerar por ícone da biblioteca.</p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setFaviconMode("upload")}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                                                faviconMode === "upload"
                                                    ? "bg-brand-600 text-white"
                                                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                                            )}
                                        >
                                            Upload de Imagem
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFaviconMode("library")}
                                            className={clsx(
                                                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                                                faviconMode === "library"
                                                    ? "bg-brand-600 text-white"
                                                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                                            )}
                                        >
                                            Biblioteca de Ícones
                                        </button>
                                    </div>

                                    {settings?.favicon_url && (
                                        <div className="rounded-lg border border-neutral-700 bg-neutral-950 p-3">
                                            <p className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2">Preview atual</p>
                                            <img src={settings.favicon_url} alt="Favicon atual" className="h-10 w-10 rounded" />
                                        </div>
                                    )}

                                    {faviconMode === "upload" ? (
                                        <div className="flex items-center gap-4">
                                            <label
                                                htmlFor="favicon-upload-input"
                                                className={clsx(
                                                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors",
                                                    uploadingFavicon
                                                        ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                                        : "bg-brand-600 hover:bg-brand-700 text-white"
                                                )}
                                            >
                                                {uploadingFavicon ? "Enviando..." : "Selecionar Imagem"}
                                            </label>
                                            <input
                                                type="file"
                                                id="favicon-upload-input"
                                                accept="image/*,.ico"
                                                className="hidden"
                                                disabled={uploadingFavicon}
                                                onChange={handleFaviconUpload}
                                            />
                                            {uploadingFavicon && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                                {FAVICON_ICON_OPTIONS.map((item) => {
                                                    const Icon = item.icon;
                                                    const isActive = selectedFaviconIcon === item.id;
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => setSelectedFaviconIcon(item.id)}
                                                            title={item.label}
                                                            className={clsx(
                                                                "h-10 rounded-lg border flex items-center justify-center transition-colors",
                                                                isActive
                                                                    ? "border-brand-500 bg-brand-900/20 text-brand-400"
                                                                    : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
                                                            )}
                                                        >
                                                            <Icon size={18} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <label className="text-sm text-neutral-400">Cor do ícone</label>
                                                <input
                                                    type="color"
                                                    value={faviconIconColor}
                                                    onChange={(e) => setFaviconIconColor(e.target.value)}
                                                    className="h-8 w-12 rounded border border-neutral-700 bg-neutral-900"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleApplyFaviconFromLibrary}
                                                disabled={applyingFaviconIcon}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50"
                                            >
                                                {applyingFaviconIcon ? "Aplicando..." : "Aplicar Ícone Selecionado"}
                                            </button>
                                        </div>
                                    )}

                                    {settings?.favicon_url && (
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    const updatedSettings = { ...settings, favicon_url: null };
                                                    await persistSettings(updatedSettings);
                                                    toast("Favicon removido.");
                                                } catch (error) {
                                                    toast(error instanceof Error ? error.message : "Erro ao remover favicon", "error");
                                                }
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-900/20 hover:bg-red-900/30 text-red-300 border border-red-900/50 transition-colors w-fit"
                                        >
                                            Remover Favicon
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4 text-brand-400">Aparência do Blog</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Layout da Home</label>
                                    <select
                                        value={settings?.home_layout || "grid"}
                                        onChange={(e) => setSettings({ ...settings, home_layout: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                                    >
                                        <option value="grid">Grade (Padrão)</option>
                                        <option value="list">Lista</option>
                                        <option value="featured">Destaque Único</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Layout do Artigo</label>
                                    <select
                                        value={settings?.article_layout || "standard"}
                                        onChange={(e) => setSettings({ ...settings, article_layout: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                                    >
                                        <option value="standard">Padrão</option>
                                        <option value="narrow">Leitura Focada (Estreito)</option>
                                        <option value="full">Largura Total</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "seo" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4 text-brand-400">SEO & Rastreamento</h2>
                            <div className="grid grid-cols-1 gap-4">
                                <InputField
                                    label="SEO Title (Global)"
                                    value={settings?.meta_title || ""}
                                    onChange={(v) => setSettings({ ...settings, meta_title: v })}
                                />
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-neutral-400 mb-1">SEO Description (Global)</label>
                                    <textarea
                                        rows={3}
                                        value={settings?.meta_description || ""}
                                        onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="ID Google Analytics (GA4)"
                                        placeholder="G-XXXXXXX"
                                        value={settings?.google_analytics_id || ""}
                                        onChange={(v) => setSettings({ ...settings, google_analytics_id: v })}
                                    />
                                    <InputField
                                        label="ID Google Tag Manager"
                                        placeholder="GTM-XXXXXXX"
                                        value={settings?.gtm_id || ""}
                                        onChange={(v) => setSettings({ ...settings, gtm_id: v })}
                                    />
                                    <div className="md:col-span-2">
                                        <InputField
                                            label="ID Facebook Pixel"
                                            placeholder="1234567890"
                                            value={settings?.facebook_pixel_id || ""}
                                            onChange={(v) => setSettings({ ...settings, facebook_pixel_id: v })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "banners" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4 text-brand-400">Banner de Conversão</h2>
                            <div className="bg-neutral-900/50 p-4 rounded-lg border border-neutral-700 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-medium text-neutral-300">Status do Banner</span>
                                    <button
                                        onClick={() => setSettings({ ...settings, banner_active: !settings.banner_active })}
                                        className={clsx(
                                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                                            settings?.banner_active ? "bg-brand-600" : "bg-neutral-700"
                                        )}
                                    >
                                        <span className={clsx(
                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                            settings?.banner_active ? "translate-x-6" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <InputField
                                        label="Texto do Banner"
                                        value={settings?.banner_text || ""}
                                        onChange={(v) => setSettings({ ...settings, banner_text: v })}
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField
                                            label="Texto do Botão"
                                            value={settings?.banner_btn_text || ""}
                                            onChange={(v) => setSettings({ ...settings, banner_btn_text: v })}
                                        />
                                        <InputField
                                            label="URL do Botão"
                                            value={settings?.banner_btn_url || ""}
                                            onChange={(v) => setSettings({ ...settings, banner_btn_url: v })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-400 mb-1">Cor de Fundo</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={settings?.banner_bg_color || "#3b82f6"}
                                                onChange={(e) => setSettings({ ...settings, banner_bg_color: e.target.value })}
                                                className="h-10 w-20 bg-neutral-900 border border-neutral-700 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={settings?.banner_bg_color || ""}
                                                onChange={(e) => setSettings({ ...settings, banner_bg_color: e.target.value })}
                                                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-700 bg-neutral-900/30 p-4">
                                <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Pré-visualização</p>
                                <div
                                    className="rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                    style={{ backgroundColor: settings?.banner_bg_color || "#0f172a" }}
                                >
                                    <p className="text-white text-lg font-bold">
                                        {settings?.banner_text || "Aumente sua conversão agora!"}
                                    </p>
                                    <span className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black font-bold text-sm">
                                        {settings?.banner_btn_text || "Quero saber mais"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "pages" && (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-4 mb-4">
                                <h2 className="text-xl font-semibold text-brand-400">Páginas Institucionais</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleCreatePage("all")}
                                        disabled={saving}
                                        className="w-full min-h-11 inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold disabled:opacity-60"
                                    >
                                        <RefreshCw size={16} />
                                        Gerar Tudo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCreatePage("privacy")}
                                        disabled={saving}
                                        className="w-full min-h-11 inline-flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                                    >
                                        <Plus size={18} />
                                        Privacidade
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCreatePage("about")}
                                        disabled={saving}
                                        className="w-full min-h-11 inline-flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                                    >
                                        <Plus size={18} />
                                        Quem Somos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCreatePage("terms")}
                                        disabled={saving}
                                        className="w-full min-h-11 inline-flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                                    >
                                        <Plus size={18} />
                                        Termos
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleCreatePage("contact")}
                                        disabled={saving}
                                        className="w-full min-h-11 inline-flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                                    >
                                        <Plus size={18} />
                                        Contato
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-xl border border-neutral-700 bg-neutral-900/40 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Nome do Blog (para as páginas legais)"
                                    value={legalBlogName}
                                    onChange={setLegalBlogName}
                                    placeholder="Ex.: Meu Blog"
                                />
                                <InputField
                                    label="E-mail de contato (para as páginas legais)"
                                    value={legalContactEmail}
                                    onChange={setLegalContactEmail}
                                    placeholder="contato@seudominio.com"
                                    type="email"
                                />
                            </div>
                            <div className="rounded-xl border border-neutral-700 bg-neutral-900/40 p-5 space-y-6">
                                <h3 className="text-sm font-semibold text-neutral-300 border-b border-neutral-700 pb-2">Links das Páginas no Site</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <InputField
                                            label="URL Quem Somos"
                                            value={settings?.url_about || "/quem-somos"}
                                            onChange={(v) => setSettings({ ...settings, url_about: v })}
                                            placeholder="/quem-somos"
                                        />
                                        <p className="text-[10px] text-neutral-500">Padrão: /quem-somos</p>
                                    </div>
                                    <div className="space-y-1">
                                        <InputField
                                            label="URL Contato"
                                            value={settings?.url_contact || "/contato"}
                                            onChange={(v) => setSettings({ ...settings, url_contact: v })}
                                            placeholder="/contato"
                                        />
                                        <p className="text-[10px] text-neutral-500">Padrão: /contato</p>
                                    </div>
                                    <div className="space-y-1">
                                        <InputField
                                            label="URL Privacidade"
                                            value={settings?.url_privacy || "/privacidade"}
                                            onChange={(v) => setSettings({ ...settings, url_privacy: v })}
                                            placeholder="/privacidade"
                                        />
                                        <p className="text-[10px] text-neutral-500">Padrão: /privacidade</p>
                                    </div>
                                    <div className="space-y-1">
                                        <InputField
                                            label="URL Termos"
                                            value={settings?.url_terms || "/termos"}
                                            onChange={(v) => setSettings({ ...settings, url_terms: v })}
                                            placeholder="/termos"
                                        />
                                        <p className="text-[10px] text-neutral-500">Padrão: /termos</p>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={saving}
                                        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                                    >
                                        <Save size={16} />
                                        {saving ? "Salvando..." : "Salvar Links"}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-neutral-300">Páginas Criadas no CMS</h3>
                                {pages.map(page => (
                                    <div key={page.id} className="flex items-center justify-between bg-neutral-900 p-4 rounded-lg border border-neutral-700">
                                        <div>
                                            <h3 className="font-medium text-white">{page.title}</h3>
                                            <span className="text-xs text-neutral-500">/{page.slug} • {page.status === 'published' ? 'Público' : 'Rascunho'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const slug = `/${page.slug}`;
                                                    setImportFeedback({
                                                        title: "Vincular Página",
                                                        message: `Deseja usar "${slug}" para qual link institucional?`,
                                                        type: "success"
                                                    });
                                                    // This is a simple feedback, but let's make it functional
                                                }}
                                                className="text-xs text-brand-500 hover:text-brand-400 font-medium px-2 py-1 rounded hover:bg-brand-900/20"
                                            >
                                                Opções
                                            </button>

                                            {/* Quick Pick dropdown/buttons could go here, but for now simple help text */}
                                            <span className="text-[10px] text-neutral-600 italic self-center">Copie o slug acima para vincular</span>
                                        </div>
                                    </div>
                                ))}
                                {pages.length === 0 && <p className="text-neutral-500 text-center py-8">Nenhuma página encontrada.</p>}
                            </div>
                        </div>
                    )}

                    {activeTab === "import" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4 text-brand-400">Importação do WordPress</h2>
                            <div className="bg-neutral-900/50 border-2 border-dashed border-neutral-700 rounded-xl p-12 text-center">
                                <Upload className="mx-auto text-neutral-500 mb-4" size={48} />
                                <p className="text-neutral-300 mb-4">Arraste seu arquivo XML (WXR) ou clique para selecionar</p>
                                <input
                                    type="file"
                                    className="hidden"
                                    id="xml-upload"
                                    accept=".xml"
                                    onChange={handleImportXML}
                                    disabled={saving}
                                />
                                <label
                                    htmlFor="xml-upload"
                                    className={clsx(
                                        "inline-flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors",
                                        saving && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {saving ? "Processando..." : "Escolher Arquivo"}
                                </label>
                                <p className="text-xs text-neutral-500 mt-4">Tamanho máximo: 10MB. Formatos aceitos: .xml</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "system" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4 text-brand-400">Configurações de Sistema</h2>
                            <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg mb-6">
                                <p className="text-amber-200 text-sm">Mantenha o Supabase apenas para dados e use autenticação local via variáveis de ambiente.</p>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-neutral-700 bg-neutral-900/40 p-5 space-y-4">
                                    <h3 className="text-base font-semibold text-white">Banco (Supabase)</h3>
                                    <p className="text-sm text-neutral-400">
                                        O CMS continua lendo e gravando conteúdo no Supabase com as variáveis do ambiente.
                                    </p>
                                    <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-4">
                                        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Variáveis do banco</p>
                                        <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all leading-relaxed">
                                            {`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TENANT_ID=`}
                                        </pre>
                                    </div>
                                    <p className="text-xs text-amber-300/90">
                                        Defina um <code>TENANT_ID</code> único para cada blog (ex.: <code>empresariadoweb</code>, <code>eshopweb</code>).
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleTestDbConnection}
                                        disabled={testingDb}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg transition-colors"
                                    >
                                        <Database size={18} />
                                        {testingDb ? "Testando conexão..." : "Testar conexão com banco"}
                                    </button>
                                </div>

                                <div className="rounded-2xl border border-neutral-700 bg-neutral-900/40 p-5 space-y-4">
                                    <h3 className="text-base font-semibold text-white">Autenticação Local</h3>
                                    <p className="text-sm text-neutral-400">
                                        O login do painel em <code>/acesso</code> usa apenas variáveis locais e sessão via cookie.
                                    </p>
                                    <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-4">
                                        <p className="text-xs uppercase tracking-wider text-neutral-500 mb-2">Variáveis de auth</p>
                                        <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all leading-relaxed">
                                            {`ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=`}
                                        </pre>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleTestLocalAuth}
                                        disabled={testingLocalAuth}
                                        className="w-full inline-flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg transition-colors"
                                    >
                                        <Shield size={18} />
                                        {testingLocalAuth ? "Validando auth..." : "Testar login admin"}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-700 bg-neutral-900/40 p-5 space-y-5">
                                <h3 className="text-base font-semibold text-white">Guia de Replicação (GitHub + Vercel)</h3>
                                <p className="text-sm text-neutral-400">
                                    Use este checklist para clonar este CMS como padrão limpo e publicar novos blogs rapidamente.
                                </p>

                                <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-300">
                                    <li>No GitHub, marque este repositório como <strong>Template repository</strong> em Settings.</li>
                                    <li>Clique em <strong>Use this template</strong> para criar um novo repositório para cada blog.</li>
                                    <li>Na Vercel, importe o novo repositório em <strong>Add New Project</strong>.</li>
                                    <li>Configure as variáveis de ambiente abaixo na Vercel.</li>
                                    <li>Defina <code>TENANT_ID</code> com um valor exclusivo para este blog e que exista na tabela <code>tenants</code>.</li>
                                    <li>Defina o login local do admin em <code>ADMIN_EMAIL</code> e <code>ADMIN_PASSWORD_HASH</code>.</li>
                                    <li>Se for usar o mesmo Supabase, mantenha as mesmas chaves de banco.</li>
                                    <li>Faça o deploy e acesse <strong>/acesso</strong> para entrar no painel.</li>
                                </ol>

                                <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-4">
                                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Variáveis obrigatórias</p>
                                    <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all leading-relaxed">
                                        {`NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TENANT_ID=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SITE_NAME=
SUPERSEO_API_KEY=`}
                                    </pre>
                                </div>

                                <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-4">
                                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Gerar hash da senha admin</p>
                                    <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all leading-relaxed">
                                        {`node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA_AQUI', 12))"`}
                                    </pre>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-neutral-700 bg-neutral-900/40 p-5 space-y-5">
                                <h3 className="text-base font-semibold text-white">Guia da API SuperSEO (Publicação Automática)</h3>
                                <p className="text-sm text-neutral-400">
                                    Use este endpoint para receber artigos gerados no SuperSEO e publicar automaticamente no blog.
                                </p>

                                <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-4 space-y-2 text-sm text-neutral-300">
                                    <p><strong>Endpoint:</strong> <code>/api/blog/publish</code></p>
                                    <p><strong>Método:</strong> <code>POST</code></p>
                                    <p><strong>Auth Header:</strong> <code>X-API-Key: SUA_CHAVE</code></p>
                                    <p>
                                        <strong>Variável obrigatória:</strong> <code>SUPERSEO_API_KEY</code> (deve ser igual à chave enviada no header).
                                    </p>
                                    <p>
                                        <strong>Importante:</strong> a API publica no tenant definido em <code>TENANT_ID</code> do deploy atual.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-4">
                                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Campos aceitos no JSON</p>
                                    <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all leading-relaxed">
                                        {`title* (string)
content* (string, HTML)
excerpt (string)
seo_title (string)
seo_description (string)
cover_image_url (string)
category_slug (string)
is_published (boolean, padrão: true)`}
                                    </pre>
                                </div>

                                <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-4">
                                    <p className="text-xs uppercase tracking-wider text-neutral-500 mb-3">Exemplo de uso (curl)</p>
                                    <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all leading-relaxed">
                                        {`curl -X POST https://SEU-DOMINIO.com/api/blog/publish \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: SUA_CHAVE" \\
  -d '{
    "title": "Título do artigo",
    "content": "<h2>Introdução</h2><p>Conteúdo...</p>",
    "excerpt": "Resumo curto...",
    "seo_title": "Título SEO",
    "seo_description": "Descrição SEO",
    "cover_image_url": "https://dominio.com/imagem.jpg",
    "category_slug": "tecnologia",
    "is_published": true
  }'`}
                                    </pre>
                                </div>

                                <div className="rounded-xl border border-brand-900/50 bg-brand-950/20 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-300 mb-2">Resposta esperada</p>
                                    <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-all leading-relaxed">
                                        {`{
  "id": "uuid-ou-id",
  "url": "https://SEU-DOMINIO.com/slug-do-artigo",
  "slug": "slug-do-artigo"
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Save Button */}
                    {activeTab !== "pages" && activeTab !== "import" && (
                        <div className="mt-8 pt-6 border-t border-neutral-700 flex justify-end">
                            <button
                                onClick={handleSaveSettings}
                                disabled={saving}
                                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                            >
                                <Save size={20} />
                                {saving ? "Salvando..." : "Salvar Alterações"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <FeedbackModal
                isOpen={!!importFeedback}
                title={importFeedback?.title || ""}
                message={importFeedback?.message || ""}
                type={importFeedback?.type || "success"}
                onClose={() => setImportFeedback(null)}
            />
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
                active
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-900/20"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            )}
        >
            <Icon size={20} />
            {label}
        </button>
    );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-neutral-400 mb-1">{label}</label>
            <input
                type={type}
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 transition-all outline-none"
            />
        </div>
    );
}
