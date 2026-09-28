import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuthUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // Allow login page to render without admin sidebar or authentication redirect
  if (pathname === "/admin/login") {
    return (
      <div className="min-h-screen bg-[#08090E] text-white">{children}</div>
    );
  }

  const rawUser = await getAuthUser();
  if (!rawUser) {
    redirect(
      `/admin/login?redirect=${encodeURIComponent(pathname || "/admin")}`,
    );
  }

  const user = {
    id: String(rawUser.id),
    name: String(rawUser.name),
    email: String(rawUser.email),
    role: rawUser.role,
    isActive: Number(rawUser.isActive),
    permissions: rawUser.permissions || [],
    assignedEvents: rawUser.assignedEvents || ["ALL"],
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-white flex flex-col md:flex-row">
      <AdminSidebar user={user} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
