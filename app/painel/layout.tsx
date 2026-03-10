import { requireAdmin } from "@/lib/session";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireAdmin();
    if (!user) redirect("/acesso");

    return (
        <div className="dark min-h-screen bg-neutral-900 text-white md:flex">
            <AdminSidebar userRole={user.role} />
            <main className="min-w-0 flex-1 overflow-auto pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}
