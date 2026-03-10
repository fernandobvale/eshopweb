/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
"use client";

import Link from "next/link";
import { Globe, ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types/supabase";

interface Props {
    siteName: string;
    categories: Category[];
    logoUrl?: string | null;
    isAuthenticated?: boolean;
    urlAbout?: string | null;
    urlContact?: string | null;
}

export default function BlogHeader({
    siteName,
    categories,
    logoUrl,
    isAuthenticated = false,
    urlAbout = "/quem-somos",
    urlContact = "/contato"
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    const filteredCategories = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return categories;
        return categories.filter((cat) => cat.name.toLowerCase().includes(term));
    }, [categories, search]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!dropdownRef.current) return;
            if (!dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.refresh();
        window.location.href = "/";
    }

    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2 group">
                    {logoUrl ? (
                        <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
                    ) : (
                        <Globe className="text-brand-600 group-hover:rotate-12 transition-transform duration-300" size={24} />
                    )}
                    {!logoUrl && (
                        <span className="font-bold text-xl tracking-tight text-neutral-900 dark:text-white">
                            {siteName}
                        </span>
                    )}
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/"
                        className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-500 transition-colors"
                    >
                        Início
                    </Link>
                    <Link
                        href={urlAbout || "/quem-somos"}
                        className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-500 transition-colors"
                    >
                        Quem Somos
                    </Link>
                    <Link
                        href={urlContact || "/contato"}
                        className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-500 transition-colors"
                    >
                        Contato
                    </Link>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsOpen((v) => !v)}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-600 dark:hover:text-brand-500 transition-colors"
                            aria-expanded={isOpen}
                            aria-controls="header-categories-dropdown"
                        >
                            Categorias
                            <ChevronDown size={14} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
                        </button>

                        {isOpen && (
                            <div
                                id="header-categories-dropdown"
                                className="absolute right-0 top-[calc(100%+10px)] w-80 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl p-3 z-50"
                            >
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={15} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Buscar categoria..."
                                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                </div>

                                <div className="max-h-72 overflow-y-auto no-scrollbar pr-1">
                                    {filteredCategories.length === 0 ? (
                                        <span className="block px-3 py-2 text-sm text-neutral-500">
                                            Nenhuma categoria encontrada
                                        </span>
                                    ) : (
                                        filteredCategories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/categoria/${cat.slug}`}
                                                onClick={() => setIsOpen(false)}
                                                className="block px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                            >
                                                {cat.name}
                                            </Link>
                                        ))
                                    )}
                                </div>

                                <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                                    <Link
                                        href="/arquivo"
                                        onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2 rounded-lg text-sm font-semibold text-brand-600 dark:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                                    >
                                        Ver todos os artigos
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="flex items-center gap-4">
                    {isAuthenticated && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                        >
                            Sair
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
