"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import slugify from "slugify";

interface Tag {
    id: string;
    name: string;
    slug: string;
}

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTag, setCurrentTag] = useState<Partial<Tag> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTags();
    }, []);

    async function fetchTags() {
        try {
            const res = await fetch("/api/admin/tags");
            const data = await res.json();
            if (data.data) {
                setTags(data.data);
            }
        } catch (err) {
            console.error("Erro ao carregar tags:", err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleCreate = () => {
        setCurrentTag({ name: "", slug: "" });
        setError(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tag: Tag) => {
        setCurrentTag(tag);
        setError(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta tag?")) return;

        try {
            const res = await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
            if (res.ok) {
                setTags(tags.filter((t) => t.id !== id));
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao excluir tag");
            }
        } catch (err) {
            alert("Erro ao excluir tag");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTag?.name || !currentTag.slug) return;

        setIsSaving(true);
        setError(null);

        const isEditing = !!currentTag.id;
        const url = isEditing
            ? `/api/admin/tags/${currentTag.id}`
            : "/api/admin/tags";

        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                body: JSON.stringify(currentTag),
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (res.ok) {
                if (isEditing) {
                    setTags(tags.map((t) => (t.id === data.data.id ? data.data : t)));
                } else {
                    setTags([...tags, data.data].sort((a, b) => a.name.localeCompare(b.name)));
                }
                setIsModalOpen(false);
            } else {
                setError(data.error || "Erro ao salvar tag");
            }
        } catch (err) {
            setError("Erro ao conectar com o servidor");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNameChange = (name: string) => {
        if (!currentTag) return;
        const slug = slugify(name, { lower: true, strict: true });
        setCurrentTag({ ...currentTag, name, slug });
    };

    const filteredTags = tags.filter((t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tags</h1>
                    <p className="text-neutral-400 text-sm mt-1">Gerencie as tags para organizar seus posts.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors gap-2 shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Nova Tag
                </button>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Buscar tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-white py-2 pl-9 pr-4 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder:text-neutral-600"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-900 text-neutral-400 font-medium">
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500 animate-pulse">Carregando tags...</td>
                                </tr>
                            ) : filteredTags.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-600">Nenhuma tag encontrada.</td>
                                </tr>
                            ) : (
                                filteredTags.map((tag) => (
                                    <tr key={tag.id} className="hover:bg-neutral-900/50 transition-colors group">
                                        <td className="px-6 py-4 text-white font-medium group-hover:text-brand-400 transition-colors">
                                            {tag.name}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-neutral-900 text-neutral-400 text-xs rounded border border-neutral-800 font-mono">
                                                #{tag.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(tag)}
                                                    className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tag.id)}
                                                    className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-800 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                            <h2 className="text-xl font-bold text-white">
                                {currentTag?.id ? "Editar Tag" : "Nova Tag"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-900/20 border border-red-800/50 text-red-500 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Nome da Tag</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={currentTag?.name || ""}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Ex: Next.js"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-neutral-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={currentTag?.slug || ""}
                                    onChange={(e) => setCurrentTag(prev => ({ ...prev!, slug: e.target.value }))}
                                    placeholder="nextjs"
                                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-500 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-neutral-700"
                                />
                            </div>

                            <div className="flex gap-3 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
                                >
                                    {isSaving ? "Salvando..." : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Salvar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
