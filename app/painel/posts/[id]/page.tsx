"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import type { Category, Post } from "@/types/supabase";
import { useToast } from "@/components/ui/Toast";

export default function EditPostPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const router = useRouter();

    const [data, setData] = useState<Partial<Post> | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!id) return;
        async function fetchData() {
            try {
                const [postRes, catRes] = await Promise.all([
                    fetch(`/api/admin/posts/${id}`),
                    fetch("/api/admin/categories")
                ]);

                if (postRes.ok && catRes.ok) {
                    const postJson = await postRes.json();
                    const catJson = await catRes.json();

                    // Map post_tags to simple array if needed by the editor
                    const postData = postJson.data;
                    if (postData.post_tags) {
                        postData.tags = postData.post_tags.map((pt: any) => pt.tag_id);
                    }

                    setData(postData);
                    setCategories(catJson.data);
                } else {
                    router.push("/painel/posts");
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [id, router]);

    const handleSave = async (updatedData: Partial<Post>) => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/posts/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            if (!res.ok) {
                const err = await res.json();
                toast(err.error || "Erro ao atualizar post", "error");
                return;
            }

            router.refresh();
            toast("Post atualizado com sucesso!", "success");
        } catch (err) {
            toast("Erro de conexão", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <PostEditor
            initialData={data}
            categories={categories}
            onSave={handleSave}
            isSaving={isSaving}
        />
    );
}
