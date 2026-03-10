import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};

function timingSafeEqualString(a: string, b: string) {
    const encoder = new TextEncoder();
    const aBytes = encoder.encode(a);
    const bBytes = encoder.encode(b);
    if (aBytes.length !== bBytes.length) return false;
    let diff = 0;
    for (let i = 0; i < aBytes.length; i += 1) {
        diff |= aBytes[i] ^ bBytes[i];
    }
    return diff === 0;
}

function unauthorized() {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401, headers: CORS_HEADERS });
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key")?.trim() ?? "";
        const expectedKey = (process.env.SUPERSEO_API_KEY ?? "").trim();

        if (!expectedKey || !apiKey || !timingSafeEqualString(apiKey, expectedKey)) {
            return unauthorized();
        }

        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
            .from("categories")
            .select("id, name, slug, description")
            .order("name");

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 500, headers: CORS_HEADERS }
            );
        }

        return NextResponse.json({ data }, { status: 200, headers: CORS_HEADERS });
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || "Erro interno ao buscar categorias" },
            { status: 500, headers: CORS_HEADERS }
        );
    }
}
