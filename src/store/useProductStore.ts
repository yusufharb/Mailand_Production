import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "createdAt"> & { id?: string }) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  toggleFeatured: (id: string) => Promise<void>;
  toggleVisibility: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedProducts: Product[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category || "Standard",
          price: p.price,
          discountPrice: p.discount_price,
          images: p.images || [],
          sizes: p.sizes || ["Standard"],
          stock: p.stock,
          reviews: [],
          isFeatured: p.is_featured,
          isVisible: p.is_visible ?? true,
          createdAt: p.created_at,
        }));
        set({ products: mappedProducts });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      
      const data = await res.json();
      console.log("API Response:", data);

      if (!res.ok) {
        throw new Error(data.error || JSON.stringify(data));
      }
      
      await get().fetchProducts(); // Refresh list
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update product");
      
      // Optimistic update
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getProductById: (id) => get().products.find((p) => p.id === id),

  toggleFeatured: async (id) => {
    const product = get().getProductById(id);
    if (!product) return;
    await get().updateProduct(id, { isFeatured: !product.isFeatured });
  },

  toggleVisibility: async (id) => {
    const product = get().getProductById(id);
    if (!product) return;
    await get().updateProduct(id, { isVisible: !product.isVisible });
  },
}));

export default useProductStore;
