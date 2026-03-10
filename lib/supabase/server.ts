import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * Identifies which blog (tenant) this Next.js deploy serves.
 * Set TENANT_ID in .env.local for each individual blog deploy.
 * Example: TENANT_ID=superseo
 */
export const TENANT_ID = process.env.TENANT_ID ?? "superseo";

/**
 * Server-side Supabase client — uses cookies for session.
 * Safe for Server Components, Route Handlers and Middleware.
 */
export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: any) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }: any) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // setAll is called from a Server Component — handled by middleware
                    }
                },
            },
        }
    );
}

/**
 * Admin Supabase client with Service Role — SERVER-ONLY.
 * NEVER import this in client components or expose the key to the browser.
 */
export function createSupabaseAdminClient() {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    );
}
