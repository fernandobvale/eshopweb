import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();
    if (!session.user || !["admin", "editor"].includes(session.user.role)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session.user || !["admin", "editor"].includes(session.user.role)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, full_name, bio, website, twitter_handle, avatar_url, role } = body;

    if (!email) {
        return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();

    // Check if profile already exists
    const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

    if (existing) {
        return Response.json({ error: "Profile already exists with this email" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("profiles")
        .insert({
            id: crypto.randomUUID(), // Profiles table expects a UUID
            email,
            full_name,
            bio,
            website,
            twitter_handle,
            avatar_url,
            role: role || 'author',
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}
