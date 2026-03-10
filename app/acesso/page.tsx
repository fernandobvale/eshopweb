import type { Metadata } from "next";
import AccessPageClient from "@/components/admin/AccessPageClient";

export const metadata: Metadata = {
    title: "Acesso | Admin",
    robots: { index: false, follow: false },
};

export default function AccessPage() {
    return <AccessPageClient />;
}
