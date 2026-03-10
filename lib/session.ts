import { SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export interface SessionUser {
    id: string;
    email: string;
    role: "admin" | "editor" | "author" | "viewer";
}

export interface IronSessionData {
    user?: SessionUser;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_SECRET!,
    cookieName: "seo-blog-session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};

/**
 * Get the current iron-session — SERVER-ONLY.
 * Use in Route Handlers and Server Actions to authenticate.
 */
export async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<IronSessionData>(cookieStore, sessionOptions);
}

/**
 * Guard helper: throw if no admin session exists.
 */
export async function requireAdmin() {
    const session = await getSession();
    if (!session.user || !["admin", "editor"].includes(session.user.role)) {
        return null;
    }
    return session.user;
}
