import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session.user || !["admin", "editor"].includes(session.user.role)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { email, full_name, bio, website, twitter_handle, avatar_url, role } = body;

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("profiles")
        .update({
            email,
            full_name,
            bio,
            website,
            twitter_handle,
            avatar_url,
            role,
            updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session.user || !["admin", "editor"].includes(session.user.role)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    // Check if profile is being used as author of any post
    const { count } = await supabase
        .from("posts")
        .select("*", { count: 'exact', head: true })
        .eq("author_id", id);

    if (count && count > 0) {
        return Response.json({ error: "Cannot delete profile assigned to posts" }, { status: 400 });
    }

    const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

    if (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
}
