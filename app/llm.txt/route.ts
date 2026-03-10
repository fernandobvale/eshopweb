import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * llm.txt — Configurable control file for Large Language Models.
 * Per PRD requirement: allows whitelist/blacklist of endpoints.
 */
export async function GET() {
    const supabase = createSupabaseAdminClient();
    const { data: settings } = await supabase.from("site_settings").select("site_name, site_description, allow_llm_indexing").single();

    if (!settings?.allow_llm_indexing) {
        const txt = `# ${settings?.site_name ?? "Blog"}
User-agent: *
Disallow: /
`;
        return new NextResponse(txt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const txt = `# ${settings?.site_name ?? "Blog"}
# ${settings?.site_description ?? ""}

User-agent: *
Allow: /
Disallow: /painel
Disallow: /acesso
Disallow: /login
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`;

    return new NextResponse(txt, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
    });
}
