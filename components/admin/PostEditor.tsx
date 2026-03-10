"use client";

import { useRef, useState, type ChangeEvent } from "react";
import TipTapEditor from "./TipTapEditor";
import { toSlug } from "@/lib/seo";
import { Save, ChevronRight, Settings, Upload, Loader2, ImageIcon } from "lucide-react";
import clsx from "clsx";
import type { Post, Category } from "@/types/supabase";
import { useToast } from "@/components/ui/Toast";

interface Props {
    initialData?: Partial<Post>;
    categories: Category[];
    onSave: (data: Partial<Post>) => Promise<void>;
    isSaving: boolean;
}

export default function PostEditor({
    initialData,
    categories,
    onSave,
    isSaving,
}: Props) {
    const [data, setData] = useState<Partial<Post>>({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        status: "draft",
        category_id: "",
        seo_title: "",
        seo_description: "",
        cover_image_url: "",
        ...initialData,
    });

    const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Auto-generate slug and SEO title if empty
    const handleTitleChange = (title: string) => {
        setData((prev) => ({
            ...prev,
            title,
            slug: prev.slug === toSlug(prev.title || "") ? toSlug(title) : prev.slug,
            seo_title: prev.seo_title === prev.title ? title : prev.seo_title,
        }));
    };

    const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingCover(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt_text", data.title || "Imagem de capa");

        try {
            const res = await fetch("/api/admin/media", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();

            if (!res.ok || !json?.data?.url) {
                toast(json?.error || "Não foi possível enviar a imagem de capa.", "error");
                return;
            }

            setData((prev) => ({
                ...prev,
                cover_image_url: json.data.url,
                og_image_url: prev.og_image_url || json.data.url,
            }));
        } catch {
            toast("Erro ao enviar imagem de capa.", "error");
        } finally {
            setIsUploadingCover(false);
            if (coverInputRef.current) coverInputRef.current.value = "";
        }
    };

    return (
        <div className="flex h-full flex-col bg-neutral-900 border-l border-neutral-800">
            {/* Action Header */}
            <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-neutral-500">Posts</span>
                    <ChevronRight size={14} className="text-neutral-700" />
                    <span className="text-white font-medium">
                        {initialData ? "Editar Post" : "Novo Post"}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={data.status}
                        onChange={(e) => setData({ ...data, status: e.target.value as any })}
                        className="bg-neutral-800 text-sm text-neutral-300 border border-neutral-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
                    >
                        <option value="draft">Rascunho</option>
                        <option value="published">Publicado</option>
                        <option value="scheduled">Agendado</option>
                        <option value="archived">Arquivado</option>
                    </select>
                    <button
                        onClick={() => onSave(data)}
                        disabled={isSaving || !data.title}
                        className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                        <Save size={18} />
                        {isSaving ? "Salvando..." : "Salvar Post"}
                    </button>
                </div>
                </div>
            </header>

            {/* Editor Content */}
            <div className="flex-1 overflow-auto">
                <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6 sm:py-10">
                    {/* Main Content Area */}
                    <section className="space-y-6">
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Título do Post"
                            className="w-full bg-transparent text-3xl font-bold text-white placeholder-neutral-700 focus:outline-none sm:text-4xl"
                        />

                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-[minmax(0,1fr)_260px]">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-neutral-500 uppercase mb-1">Slug URL</label>
                                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg">
                                    <span className="text-neutral-600">/</span>
                                    <input
                                        type="text"
                                        value={data.slug}
                                        onChange={(e) => setData({ ...data, slug: toSlug(e.target.value) })}
                                        className="flex-1 bg-transparent text-neutral-300 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-500 uppercase mb-1">Categoria</label>
                                <select
                                    value={data.category_id || ""}
                                    onChange={(e) => setData({ ...data, category_id: e.target.value })}
                                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
                                >
                                    <option value="">Sem Categoria</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tabs Sidebar/Overlay for SEO vs Content */}
                        <div className="flex border-b border-neutral-800">
                            <TabButton
                                active={activeTab === "content"}
                                onClick={() => setActiveTab("content")}
                                label="Conteúdo"
                            />
                            <TabButton
                                active={activeTab === "seo"}
                                onClick={() => setActiveTab("seo")}
                                label="SEO & Metadados"
                            />
                        </div>

                        {activeTab === "content" ? (
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2 gap-3">
                                        <label className="block text-xs font-medium text-neutral-500 uppercase">Imagem de Capa</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                ref={coverInputRef}
                                                onChange={handleCoverUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => coverInputRef.current?.click()}
                                                disabled={isUploadingCover}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-brand-500 hover:text-white transition disabled:opacity-50"
                                            >
                                                {isUploadingCover ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Upload size={14} />
                                                )}
                                                {isUploadingCover ? "Enviando..." : "Subir Imagem"}
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.cover_image_url || ""}
                                        onChange={(e) => setData({ ...data, cover_image_url: e.target.value })}
                                        placeholder="Cole a URL da imagem ou use o upload"
                                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-500"
                                    />
                                    {data.cover_image_url && (
                                        <div className="mt-3">
                                            <div className="relative h-40 w-full rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
                                                <img
                                                    src={data.cover_image_url}
                                                    alt={data.title || "Preview da capa"}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setData((prev) => ({ ...prev, cover_image_url: "" }))}
                                                className="mt-2 text-xs text-neutral-400 hover:text-red-400 transition-colors"
                                            >
                                                Remover imagem de capa
                                            </button>
                                        </div>
                                    )}
                                    {!data.cover_image_url && (
                                        <div className="mt-3 h-24 rounded-xl border border-dashed border-neutral-800 bg-neutral-950 text-neutral-600 text-xs flex items-center justify-center gap-2">
                                            <ImageIcon size={14} />
                                            Nenhuma imagem de capa selecionada
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">Resumo / Excerpt</label>
                                    <textarea
                                        value={data.excerpt || ""}
                                        onChange={(e) => setData({ ...data, excerpt: e.target.value })}
                                        rows={3}
                                        placeholder="Um breve resumo para listagens..."
                                        className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-lg px-4 py-2 focus:outline-none focus:border-brand-500 resize-none"
                                    />
                                </div>
                                <TipTapEditor
                                    content={data.content || ""}
                                    onChange={(html) => setData({ ...data, content: html })}
                                />
                            </div>
                        ) : (
                            <SeoForm data={data} setData={setData} />
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "px-6 py-3 text-sm font-medium transition-colors border-b-2",
                active ? "text-brand-500 border-brand-500" : "text-neutral-500 border-transparent hover:text-neutral-300"
            )}
        >
            {label}
        </button>
    );
}

function SeoForm({ data, setData }: { data: any; setData: any }) {
    return (
        <div className="space-y-6 bg-neutral-950 p-6 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-2 text-brand-500 mb-2">
                <Settings size={18} />
                <h3 className="font-semibold">Otimização SEO</h3>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">SEO Title</label>
                <input
                    type="text"
                    value={data.seo_title || ""}
                    onChange={(e) => setData({ ...data, seo_title: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-500"
                />
                <p className="text-[10px] text-neutral-600 mt-1">Título que aparecerá no Google. Recomendado: ~60 caracteres.</p>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">SEO Meta Description</label>
                <textarea
                    value={data.seo_description || ""}
                    onChange={(e) => setData({ ...data, seo_description: e.target.value })}
                    rows={3}
                    className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-500 resize-none"
                />
                <p className="text-[10px] text-neutral-600 mt-1">Resumo para o Google. Recomendado: ~160 caracteres.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">URL Canônica</label>
                    <input
                        type="text"
                        value={data.canonical_url || ""}
                        onChange={(e) => setData({ ...data, canonical_url: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-500"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-neutral-500 uppercase mb-2">Imagem OG (Open Graph)</label>
                    <input
                        type="text"
                        value={data.og_image_url || ""}
                        onChange={(e) => setData({ ...data, og_image_url: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-500"
                    />
                </div>
            </div>
        </div>
    );
}
