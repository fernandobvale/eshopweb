import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import type { IronSessionData } from "@/lib/session";
import { sessionOptions } from "@/lib/session";

// Routes that require authentication
const PROTECTED_PATHS = ["/painel"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Handle dynamic 301/302 redirects from DB (edge-safe text lookup via headers)
    // Full redirect lookup happens in the route handler; middleware only guards admin

    const isProtected = PROTECTED_PATHS.some((path) =>
        pathname.startsWith(path)
    );

    if (isProtected) {
        const response = NextResponse.next();
        const session = await getIronSession<IronSessionData>(
            request.cookies as any,
            sessionOptions
        );

        if (!session.user) {
            const loginUrl = new URL("/acesso", request.url);
            loginUrl.searchParams.set("from", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Security headers
    const response = NextResponse.next();
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, sitemap.xml, robots.txt, llm.txt
         */
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|llm.txt).*)",
    ],
};
