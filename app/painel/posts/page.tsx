"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Search, Filter, ExternalLink } from "lucide-react";
import clsx from "clsx";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Post {
    id: string;
    title: string;
    slug: string;
    status: "draft" | "published" | "scheduled" | "archived";
    created_at: string;
    published_at: string | null;
}

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletePostId, setDeletePostId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    async function fetchPosts() {
        try {
            const res = await fetch("/api/admin/posts");
            const json = await res.json();
            if (res.ok) {
                setPosts(json.data);
            } else {
                setError(json.error);
            }
        } catch (err) {
            setError("Erro ao carregar posts");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (!deletePostId) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/posts/${deletePostId}`, { method: "DELETE" });
            if (res.ok) {
                setPosts(posts.filter((p) => p.id !== deletePostId));
                setDeletePostId(null);
            } else {
                setError("Erro ao excluir post");
            }
        } catch (err) {
            setError("Erro de conexão ao excluir post");
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Posts</h1>
                    <p className="text-neutral-400 text-sm mt-1">Gerencie seu conteúdo</p>
                </div>
                <Link
                    href="/painel/posts/novo"
                    className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                    <Plus size={18} />
                    Novo Post
                </Link>
            </div>

            {error ? (
                <div className="bg-red-900/30 border border-red-800 p-4 rounded-lg text-red-400 text-sm">{error}</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-neutral-950 border border-neutral-800 rounded-xl">
                    <p className="text-neutral-500">Nenhum post encontrado.</p>
                    <Link href="/painel/posts/novo" className="text-brand-500 hover:underline text-sm mt-2 inline-block">
                        Criar meu primeiro post
                    </Link>
                </div>
            ) : (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-neutral-900 text-neutral-400 font-medium border-b border-neutral-800">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Título</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-neutral-900/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <StatusBadge status={post.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-white font-medium line-clamp-1">{post.title}</p>
                                        <p className="text-neutral-500 text-xs mt-0.5">/{post.slug}</p>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-400">
                                        {new Date(post.created_at).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {post.status === 'published' && (
                                                <Link
                                                    href={`/${post.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-neutral-500 hover:text-white transition-colors"
                                                    title="Visualizar no site"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                            )}
                                            <Link
                                                href={`/painel/posts/${post.id}`}
                                                className="p-2 text-neutral-500 hover:text-white transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => setDeletePostId(post.id)}
                                                className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deletePostId}
                title="Excluir post"
                description="Esta ação não pode ser desfeita. Deseja realmente excluir este post?"
                isLoading={isDeleting}
                onCancel={() => setDeletePostId(null)}
                onConfirm={handleDelete}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: Post["status"] }) {
    const styles = {
        published: "bg-emerald-900/30 text-emerald-400 border-emerald-800",
        draft: "bg-neutral-800 text-neutral-400 border-neutral-700",
        scheduled: "bg-brand-900/30 text-brand-400 border-brand-800",
        archived: "bg-red-900/30 text-red-400 border-red-800",
    };

    const labels = {
        published: "Publicado",
        draft: "Rascunho",
        scheduled: "Agendado",
        archived: "Arquivado",
    };

    return (
        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", styles[status])}>
            {labels[status]}
        </span>
    );
}

function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
    );
}
