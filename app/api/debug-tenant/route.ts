import { NextResponse } from "next/server";
import { TENANT_ID } from "@/lib/supabase/server";

export async function GET() {
    return NextResponse.json({
        TENANT_ID,
        ENV_TENANT_ID: process.env.TENANT_ID,
        NODE_ENV: process.env.NODE_ENV
    });
}
