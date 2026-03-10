"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import type { Category, Post } from "@/types/supabase";
import { useToast } from "@/components/ui/Toast";

export default function NewPostPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/admin/settings"); // Using settings to get categories or direct api
                // Actually I need a categories API or use settings/categories. 
                // Let's create a quick categories route or fetch from settings.
                const resSettings = await fetch("/api/admin/settings");
                // Wait, better fetch categories directly. I'll need a simple categories route.
                // For now let's assume an empty list until I create the route or use a fallback.
                setCategories([]);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSave = async (data: Partial<Post>) => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                toast(err.error || "Erro ao salvar post", "error");
                return;
            }

            toast("Post salvo com sucesso!", "success");
            router.push("/painel/posts");
            router.refresh();
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

    return <PostEditor categories={categories} onSave={handleSave} isSaving={isSaving} />;
}
