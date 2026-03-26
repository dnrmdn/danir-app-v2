import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminLayoutClient from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();

  if (!admin) {
    // getAdminSession returns null for both unauthenticated and non-admin users.
    // Redirect to login — middleware already handles the cookie check,
    // but the layout is the authoritative role check.
    redirect("/login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
