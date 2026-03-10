import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createSupabaseAdminClient, TENANT_ID } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function GET() {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
        .from("media")
        .select("*")
        .eq("tenant_id", TENANT_ID)
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
    const user = await requireAdmin();
    if (!user || user.role === "author") return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const altText = formData.get("alt_text") as string || "";

        if (!file) {
            return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
        }

        const supabase = createSupabaseAdminClient();
        const bucketName = "media";

        // Ensure storage bucket exists (helpful on fresh Supabase projects).
        const { data: bucket, error: bucketError } = await supabase.storage.getBucket(bucketName);
        if (bucketError && bucketError.message.toLowerCase().includes("not found")) {
            const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 10 * 1024 * 1024, // 10MB
            });
            if (createBucketError) {
                return NextResponse.json({ error: `Erro ao criar bucket de mídia: ${createBucketError.message}` }, { status: 500 });
            }
        } else if (bucketError && !bucket) {
            return NextResponse.json({ error: `Erro ao verificar bucket de mídia: ${bucketError.message}` }, { status: 500 });
        }

        // 1. Upload to Supabase Storage
        const fileExt = file.name.includes(".") ? file.name.split(".").pop() : "bin";
        const fileName = `${randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { data: storageData, error: storageError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false
            });

        if (storageError) {
            return NextResponse.json({ error: `Erro no storage: ${storageError.message}` }, { status: 500 });
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        // 3. Save to database
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        const DEV_ADMIN_ID = "00000000-0000-0000-0000-000000000000";

        const { data: mediaData, error: dbError } = await supabase
            .from("media")
            .insert({
                uploaded_by: (isUuid && user.id !== DEV_ADMIN_ID) ? user.id : null,
                filename: file.name,
                url: publicUrl,
                mime_type: file.type,
                size_bytes: file.size,
                alt_text: altText,
                tenant_id: TENANT_ID,
            })
            .select()
            .single();

        if (dbError) {
            // Cleanup storage if database insert fails
            await supabase.storage.from(bucketName).remove([filePath]);
            return NextResponse.json({ error: `Erro no banco: ${dbError.message}` }, { status: 500 });
        }

        return NextResponse.json({ data: mediaData }, { status: 201 });
    } catch (err: any) {
        console.error("Erro de upload de mídia:", err);
        return NextResponse.json({ error: err?.message || "Erro interno ao processar upload" }, { status: 500 });
    }
}
