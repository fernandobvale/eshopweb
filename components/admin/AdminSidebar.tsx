"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    FolderOpen,
    Tag,
    Image,
    Settings,
    LogOut,
    Globe,
    UserCircle2,
    Menu,
    X,
} from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/painel", icon: LayoutDashboard, roles: ["admin", "editor", "author"] },
    { label: "Posts", href: "/painel/posts", icon: FileText, roles: ["admin", "editor", "author"] },
    { label: "Perfil", href: "/painel/perfil", icon: UserCircle2, roles: ["admin", "editor", "author"] },
    { label: "Categorias", href: "/painel/categorias", icon: FolderOpen, roles: ["admin", "editor"] },
    { label: "Tags", href: "/painel/tags", icon: Tag, roles: ["admin", "editor"] },
    { label: "Mídia", href: "/painel/midia", icon: Image, roles: ["admin", "editor", "author"] },
    { label: "Configurações", href: "/painel/configuracoes", icon: Settings, roles: ["admin"] },
];

interface Props {
    userRole: string;
}

export default function AdminSidebar({ userRole }: Props) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const visibleItems = NAV_ITEMS.filter((item) =>
        item.roles.includes(userRole)
    );

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/acesso";
    }

    function isActivePath(href: string) {
        return href === "/painel" ? pathname === "/painel" : pathname.startsWith(href);
    }

    useEffect(() => {
        function syncViewport() {
            const desktop = window.innerWidth >= 768;
            setIsDesktop(desktop);
            if (desktop) {
                setIsMobileOpen(false);
            }
        }

        syncViewport();
        window.addEventListener("resize", syncViewport);
        return () => window.removeEventListener("resize", syncViewport);
    }, []);

    if (!isDesktop) {
        return (
            <>
                <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4">
                <Link href="/" className="flex items-center gap-2 text-white hover:text-brand-400 transition">
                    <Globe size={20} className="text-brand-500" />
                    <span className="font-bold text-sm tracking-wide">SEO Blog</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLogout}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white"
                    >
                        Sair
                    </button>
                    <button
                        onClick={() => setIsMobileOpen((prev) => !prev)}
                        className="rounded-lg p-2 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            {isMobileOpen && (
                <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setIsMobileOpen(false)}>
                    <aside
                        className="h-full w-72 border-r border-neutral-800 bg-neutral-950 p-4"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-4">
                            <span className="text-sm font-semibold text-neutral-200">Menu do Painel</span>
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="rounded-lg p-2 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <nav className="space-y-1">
                            {visibleItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActivePath(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={clsx(
                                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-brand-600 text-white"
                                                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                        )}
                                    >
                                        <Icon size={18} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            )}
            </>
        );
    }

    return (
        <aside className="flex min-h-screen w-60 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950">
            <div className="border-b border-neutral-800 px-5 py-6">
                <Link href="/" className="flex items-center gap-2 text-white hover:text-brand-400 transition">
                    <Globe size={22} className="text-brand-500" />
                    <span className="font-bold text-sm tracking-wide">SEO Blog</span>
                </Link>
            </div>

            <nav className="flex-1 space-y-0.5 px-3 py-4">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-brand-600 text-white"
                                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                            )}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="px-3 pb-4">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
