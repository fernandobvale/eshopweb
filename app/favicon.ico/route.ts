import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export async function GET() {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
        .from("site_settings")
        .select("favicon_url, updated_at")
        .single();

    const faviconUrl = data?.favicon_url;
    if (faviconUrl) {
        const target = faviconUrl.startsWith("data:")
            ? faviconUrl
            : `${faviconUrl}${faviconUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(data?.updated_at || "")}`;
        return NextResponse.redirect(target, {
            status: 307,
            headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
        });
    }

    return new NextResponse(null, {
        status: 204,
        headers: {
            "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400",
        },
    });
}
