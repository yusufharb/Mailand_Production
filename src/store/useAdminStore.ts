import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialAdminData } from "@/lib/mock/adminData";
import useProductStore from "@/store/useProductStore";
import { supabase } from "@/lib/supabase";
import type { Product, Order, Customer, Coupon, SiteSettings } from "@/types";

interface AdminState {
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  siteSettings: SiteSettings;
  isAuthenticated: boolean;

  // Product actions — all delegate to useProductStore
  addProduct: (product: Omit<Product, "id" | "createdAt"> & { id?: string }) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleFeatured: (id: string) => void;
  toggleVisibility: (id: string) => void;

  // Orders
  setOrders: (orders: Order[]) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;

  // Coupons
  setCoupons: (coupons: Coupon[]) => void;
  addCoupon: (coupon: Omit<Coupon, "id">) => void;
  toggleCouponStatus: (id: string) => void;

  // Settings
  fetchSettings: () => Promise<void>;
  updateSiteSettings: (settings: SiteSettings) => Promise<void>;

  // Auth
  login: (password: string) => boolean;
  logout: () => void;
}

const defaultSiteSettings: SiteSettings = {
  hero: {
    title: "Embrace Your\nNatural Glow",
    subtitle:
      "Discover our new line of deeply nourishing body lotions and refreshing sprays. Crafted with love for radiant skin.",
    image:
      "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=1200",
    ctaText: "Shop the Collection",
    ctaLink: "/products",
  },
  footer: {
    about:
      "Discover your glow. Premium body lotions and sprays crafted for elegance and everyday beauty.",
    links: [
      { title: "Body Lotions", url: "/products" },
      { title: "Body Sprays", url: "/products" },
      { title: "Contact Us", url: "#contact" },
    ],
    social: {
      instagram: "#",
      twitter: "#",
      facebook: "#",
      tiktok: "#",
    },
  },
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      orders: initialAdminData.orders as Order[],
      customers: initialAdminData.customers as Customer[],
      coupons: initialAdminData.coupons as Coupon[],
      siteSettings: defaultSiteSettings,
      isAuthenticated: false,

      // Product CRUD — all delegate to the single product store
      addProduct: (product) => useProductStore.getState().addProduct(product),
      updateProduct: (id, updates) => useProductStore.getState().updateProduct(id, updates),
      deleteProduct: (id) => useProductStore.getState().deleteProduct(id),
      toggleFeatured: (id) => useProductStore.getState().toggleFeatured(id),
      toggleVisibility: (id) => useProductStore.getState().toggleVisibility(id),

      setOrders: (orders) => set({ orders }),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        })),

      setCoupons: (coupons) => set({ coupons }),
      addCoupon: (coupon) =>
        set((state) => ({
          coupons: [{ ...coupon, id: `CPN-${Date.now()}` }, ...state.coupons],
        })),
      toggleCouponStatus: (id) =>
        set((state) => ({
          coupons: state.coupons.map((c) =>
            c.id === id ? { ...c, isActive: !c.isActive } : c
          ),
        })),

      fetchSettings: async () => {
        try {
          const { data, error } = await supabase.from("settings").select("*").single();
          if (error) throw error;
          if (data) {
            set({
              siteSettings: {
                hero: {
                  title: data.hero_title || "",
                  subtitle: data.hero_subtitle || "",
                  image: data.hero_image || "",
                  ctaText: data.hero_cta_text || "",
                  ctaLink: data.hero_cta_link || "",
                },
                footer: {
                  about: data.footer_about || "",
                  links: data.footer_links || [],
                  social: data.footer_social || {},
                },
              },
            });
          }
        } catch (e) {
          console.error("Error fetching settings:", e);
        }
      },

      updateSiteSettings: async (settings) => {
        try {
          const res = await fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
          });
          if (res.ok) {
            set({ siteSettings: settings });
          } else {
            console.error("Failed to update settings in DB");
          }
        } catch (e) {
          console.error(e);
        }
      },

      login: (password: string) => {
        if (password === "111111") {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: "mailand-admin-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        // we omit siteSettings and orders from local storage since they come from DB now
      }),
    }
  )
);

export default useAdminStore;
