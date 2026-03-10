import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await requireAdmin();
    if (!user || user.role === "author") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const { id } = await params;
    const supabase = createSupabaseAdminClient();

    // 1. Get info to find file in storage
    const { data: media, error: getError } = await supabase
        .from("media")
        .select("*")
        .eq("id", id)
        .single();

    if (getError || !media) {
        return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
    }

    // 2. Remove from Storage
    // Extract path from URL or reconstruct it if we followed the {user_id}/{filename} pattern
    // The public URL looks like: .../storage/v1/object/public/media/{user_id}/{filename}
    // We need the relative path: {user_id}/{filename}
    const urlParts = (media as any).url.split("/media/");
    const storagePath = urlParts[1];

    if (storagePath) {
        const { error: storageError } = await supabase.storage
            .from("media")
            .remove([storagePath]);

        if (storageError) {
            console.error("Storage delete error:", storageError);
            // We continue anyway to cleanup DB record? 
            // Or stop? Better to stop if storage fails to avoid orphan files.
            // However, sometimes files are already gone.
        }
    }

    // 3. Delete from DB
    const { error: dbError } = await supabase
        .from("media")
        .delete()
        .eq("id", id);

    if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
