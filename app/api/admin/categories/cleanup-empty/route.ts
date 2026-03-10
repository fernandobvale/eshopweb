import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST() {
    const user = await requireAdmin();
    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Apenas administradores podem limpar categorias." }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();

    const [{ data: categories, error: catError }, { data: posts, error: postError }] = await Promise.all([
        supabase.from("categories").select("id"),
        supabase.from("posts").select("category_id").not("category_id", "is", null),
    ]);

    if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });
    if (postError) return NextResponse.json({ error: postError.message }, { status: 500 });

    const usedCategoryIds = new Set((posts ?? []).map((p: any) => p.category_id).filter(Boolean));
    const emptyCategoryIds = (categories ?? [])
        .map((c: any) => c.id as string)
        .filter((id: string) => !usedCategoryIds.has(id));

    if (emptyCategoryIds.length === 0) {
        return NextResponse.json({ deletedCount: 0, remainingCount: categories?.length ?? 0 });
    }

    const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .in("id", emptyCategoryIds);

    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    return NextResponse.json({
        deletedCount: emptyCategoryIds.length,
        remainingCount: (categories?.length ?? 0) - emptyCategoryIds.length,
    });
}
