"use client";

import { Menu, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/coupons": "Coupons",
  "/admin/settings": "Site Settings",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { products } = useProductStore();
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;

  const title = PAGE_TITLES[pathname] || "Admin";

  return (
    <header className="bg-white border-b border-gray-100 px-5 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 md:hidden transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {lowStockCount > 0 && (
          <div className="relative">
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                {lowStockCount}
              </span>
            </button>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          A
        </div>
      </div>
    </header>
  );
}
