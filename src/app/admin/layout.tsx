import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawUser = await getAuthUser();
  const user = rawUser
    ? {
        id: String(rawUser.id),
        name: String(rawUser.name),
        email: String(rawUser.email),
        role: rawUser.role,
        isActive: Number(rawUser.isActive),
        permissions: rawUser.permissions || [],
        assignedEvents: rawUser.assignedEvents || ["ALL"],
      }
    : null;

  // If viewing /admin/login, don't redirect
  // Note: Next.js evaluates layout for all nested routes
  // For other routes, if no user, redirect to login

  return (
    <div className="min-h-screen bg-[#08090E] text-white flex flex-col md:flex-row">
      {user ? (
        <>
          <AdminSidebar user={user} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
            {children}
          </main>
        </>
      ) : (
        <div className="flex-1 w-full">{children}</div>
      )}
    </div>
  );
}
