"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, Search, Sparkles } from "lucide-react";
import slugify from "slugify";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [flashError, setFlashError] = useState<string | null>(null);
    const [flashSuccess, setFlashSuccess] = useState<string | null>(null);
    const [isCleanupOpen, setIsCleanupOpen] = useState(false);
    const [isCleaningUp, setIsCleaningUp] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await fetch("/api/admin/categories");
            const data = await res.json();
            if (data.data) {
                setCategories(data.data);
            }
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCleanupEmptyCategories() {
        setIsCleaningUp(true);
        setFlashError(null);
        setFlashSuccess(null);
        try {
            const res = await fetch("/api/admin/categories/cleanup-empty", { method: "POST" });
            const data = await res.json();
            if (!res.ok) {
                setFlashError(data.error || "Erro ao limpar categorias vazias.");
            } else {
                await fetchCategories();
                setFlashSuccess(`${data.deletedCount} categoria(s) vazia(s) removida(s).`);
                setIsCleanupOpen(false);
            }
        } catch (err) {
            setFlashError("Erro de conexão ao limpar categorias vazias.");
        } finally {
            setIsCleaningUp(false);
        }
    }

    const handleCreate = () => {
        setCurrentCategory({ name: "", slug: "", description: "" });
        setError(null);
        setFlashError(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setCurrentCategory(category);
        setError(null);
        setFlashError(null);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteCategoryId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/categories/${deleteCategoryId}`, { method: "DELETE" });
            if (res.ok) {
                setCategories(categories.filter((c) => c.id !== deleteCategoryId));
                setDeleteCategoryId(null);
            } else {
                const data = await res.json();
                setFlashError(data.error || "Erro ao excluir categoria");
            }
        } catch (err) {
            setFlashError("Erro ao excluir categoria");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCategory?.name || !currentCategory.slug) return;

        setIsSaving(true);
        setError(null);

        const isEditing = !!currentCategory.id;
        const url = isEditing
            ? `/api/admin/categories/${currentCategory.id}`
            : "/api/admin/categories";

        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                body: JSON.stringify(currentCategory),
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (res.ok) {
                if (isEditing) {
                    setCategories(categories.map((c) => (c.id === data.data.id ? data.data : c)));
                } else {
                    setCategories([...categories, data.data].sort((a, b) => a.name.localeCompare(b.name)));
                }
                setIsModalOpen(false);
            } else {
                setError(data.error || "Erro ao salvar categoria");
            }
        } catch (err) {
            setError("Erro ao conectar com o servidor");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNameChange = (name: string) => {
        if (!currentCategory) return;
        const slug = slugify(name, { lower: true, strict: true });
        setCurrentCategory({ ...currentCategory, name, slug });
    };

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Categorias</h1>
                    <p className="text-neutral-400 text-sm mt-1">Gerencie as categorias do seu blog.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setIsCleanupOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors gap-2 border border-neutral-700"
                    >
                        <Sparkles className="w-4 h-4" />
                        Limpar Categorias Vazias
                    </button>
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors gap-2 shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Categoria
                    </button>
                </div>
            </div>

            {flashError && (
                <div className="rounded-lg border border-red-800/60 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                    {flashError}
                </div>
            )}
            {flashSuccess && (
                <div className="rounded-lg border border-emerald-800/60 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-300">
                    {flashSuccess}
                </div>
            )}

            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Buscar categorias..."
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
                                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500 animate-pulse">Carregando categorias...</td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-600">Nenhuma categoria encontrada.</td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-neutral-900/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white group-hover:text-brand-400 transition-colors">{category.name}</div>
                                            {category.description && (
                                                <div className="text-xs text-neutral-500 line-clamp-1 max-w-xs">{category.description}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-neutral-900 text-neutral-400 text-xs rounded border border-neutral-800 font-mono">
                                                {category.slug}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-all"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteCategoryId(category.id)}
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
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                            <h2 className="text-xl font-bold text-white">
                                {currentCategory?.id ? "Editar Categoria" : "Nova Categoria"}
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
                                <label className="text-sm font-medium text-neutral-400">Nome</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={currentCategory?.name || ""}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Ex: Tecnologia"
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-neutral-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={currentCategory?.slug || ""}
                                    onChange={(e) => setCurrentCategory(prev => ({ ...prev!, slug: e.target.value }))}
                                    placeholder="tecnologia"
                                    className="w-full bg-neutral-950 border border-neutral-800 text-neutral-500 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all placeholder:text-neutral-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-400">Descrição (Opcional)</label>
                                <textarea
                                    value={currentCategory?.description || ""}
                                    onChange={(e) => setCurrentCategory(prev => ({ ...prev!, description: e.target.value }))}
                                    placeholder="Sobre o que é esta categoria?"
                                    rows={3}
                                    className="w-full bg-neutral-900 border border-neutral-800 text-white px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none transition-all placeholder:text-neutral-700"
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

            <ConfirmModal
                isOpen={!!deleteCategoryId}
                title="Excluir categoria"
                description="Esta ação não pode ser desfeita. Deseja realmente excluir esta categoria?"
                isLoading={isDeleting}
                onCancel={() => setDeleteCategoryId(null)}
                onConfirm={handleDelete}
            />
            <ConfirmModal
                isOpen={isCleanupOpen}
                title="Limpar categorias vazias"
                description="Vamos remover apenas categorias sem nenhum post vinculado. Deseja continuar?"
                confirmLabel="Limpar agora"
                isLoading={isCleaningUp}
                onCancel={() => setIsCleanupOpen(false)}
                onConfirm={handleCleanupEmptyCategories}
            />
        </div>
    );
}
