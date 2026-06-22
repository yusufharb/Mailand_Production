"use client";

import { Sidebar } from "@/components/admin/Sidebar";
import { Header } from "@/components/admin/Header";
import { Toaster } from "react-hot-toast";
import { useAdminStore } from "@/store/useAdminStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) return null;

  if (pathname === "/admin/login") {
    return (
      <>
        {children}
        <Toaster position="top-right" />
      </>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "10px", fontSize: "14px" },
        }}
      />
    </div>
  );
}
