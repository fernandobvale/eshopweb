import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

export async function GET() {
    try {
        const session = await getSession();
        if (!session.user || !["admin", "editor"].includes(session.user.role)) {
            return Response.json({ error: "Não autorizado" }, { status: 401 });
        }

        const email = (process.env.ADMIN_EMAIL || "").trim();
        const passwordHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
        const secret = (process.env.SESSION_SECRET || "").trim();

        const hasHashFormat = /^\$2[aby]\$\d{2}\$/.test(passwordHash);

        if (!email || !passwordHash || !secret) {
            return Response.json(
                {
                    ok: false,
                    error: "Faltam variáveis de autenticação local (ADMIN_EMAIL, ADMIN_PASSWORD_HASH, SESSION_SECRET).",
                },
                { status: 500 }
            );
        }

        if (secret.length < 32) {
            return Response.json(
                { ok: false, error: "SESSION_SECRET precisa ter ao menos 32 caracteres." },
                { status: 500 }
            );
        }

        if (!hasHashFormat) {
            return Response.json(
                { ok: false, error: "ADMIN_PASSWORD_HASH não parece um hash bcrypt válido." },
                { status: 500 }
            );
        }

        const hashInfo = bcrypt.getRounds(passwordHash);
        return Response.json({
            ok: true,
            message: `Autenticação local pronta (bcrypt rounds: ${hashInfo}).`,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro interno do servidor.";
        return Response.json({ ok: false, error: message }, { status: 500 });
    }
}
