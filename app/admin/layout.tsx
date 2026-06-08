import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    template: "%s | Панель Администратора",
    default: "Админ-панель",
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-[#141414] text-white">
      {/* Persistent Sidebar */}
      <AdminSidebar username={session.user.name || session.user.email || "Администратор"} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-[60px] shrink-0" />
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
