"use client";

import { useState } from "react";
import FeedbackModal from "@/components/ui/FeedbackModal";

function getErrorMessageFromResponse(json: any) {
    if (json && typeof json === "object" && typeof json.error === "string" && json.error.trim()) {
        return json.error;
    }
    return "Não foi possível entrar. Verifique as credenciais do administrador.";
}

export default function AccessPageClient() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const raw = await res.text();
            let json: any = {};
            try {
                json = raw ? JSON.parse(raw) : {};
            } catch {
                json = {};
            }

            if (res.ok) {
                window.location.href = "/painel";
                return;
            }

            setFeedback({
                title: "Falha no login",
                message: getErrorMessageFromResponse(json),
            });
        } catch {
            setFeedback({
                title: "Erro de conexão",
                message: "Não foi possível conectar ao servidor para autenticar.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-white">CMS Admin</h1>
                    <p className="text-neutral-400 mt-1 text-sm">Acesse o painel editorial</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                            placeholder="admin@exemplo.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-1">
                            Senha
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-60"
                    >
                        {submitting ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>

            <FeedbackModal
                isOpen={!!feedback}
                title={feedback?.title || ""}
                message={feedback?.message || ""}
                type="error"
                onClose={() => setFeedback(null)}
            />
        </div>
    );
}
