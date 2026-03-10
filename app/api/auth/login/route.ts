import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { validateLocalAdminCredentials } from "@/lib/auth/local-admin";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email e senha são obrigatórios." },
                { status: 400 }
            );
        }

        const isValid = await validateLocalAdminCredentials(email, password);
        if (!isValid) {
            return NextResponse.json(
                { error: "Credenciais inválidas." },
                { status: 401 }
            );
        }

        // Save to iron-session
        const session = await getSession();
        // Use a stable UUID for the local admin in development
        const DEV_ADMIN_ID = "00000000-0000-0000-0000-000000000000";

        session.user = {
            id: DEV_ADMIN_ID,
            email: email.trim().toLowerCase(),
            role: "admin",
        };
        await session.save();

        return NextResponse.json({
            success: true,
            user: { id: DEV_ADMIN_ID, email: session.user.email, role: "admin" },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro interno do servidor.";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
