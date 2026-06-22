"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  Settings,
  X,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/useAdminStore";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "Overview",  href: "/admin",            icon: LayoutDashboard },
  { name: "Products",  href: "/admin/products",   icon: Package },
  { name: "Orders",    href: "/admin/orders",      icon: ShoppingBag },
  { name: "Customers", href: "/admin/customers",   icon: Users },
  { name: "Coupons",   href: "/admin/coupons",     icon: Tag },
  { name: "Settings",  href: "/admin/settings",   icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAdminStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-gray-100 flex-col h-screen sticky top-0 shadow-sm">
        <SidebarContent
          pathname={pathname}
          onLogout={handleLogout}
          onClose={onClose}
        />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-50 shadow-xl transition-transform duration-300 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-xl font-serif font-bold text-rosegold">Mailand</span>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent
          pathname={pathname}
          onLogout={handleLogout}
          onClose={onClose}
          showHeader={false}
        />
      </aside>
    </>
  );
}

function SidebarContent({
  pathname,
  onLogout,
  onClose,
  showHeader = true,
}: {
  pathname: string;
  onLogout: () => void;
  onClose: () => void;
  showHeader?: boolean;
}) {
  return (
    <>
      {showHeader && (
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/admin" className="block">
            <h2 className="text-xl font-serif font-bold text-rosegold">Mailand</h2>
            <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
          </Link>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon
                size={18}
                className={cn(isActive ? "text-primary" : "text-gray-400")}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all"
        >
          <ExternalLink size={16} className="text-gray-400" />
          View Store
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );
}
