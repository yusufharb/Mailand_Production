import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotal: () => number;
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === newItem.id && i.size === newItem.size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === newItem.id && i.size === newItem.size
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && i.size === size)
          ),
        })),

      updateQuantity: (id, size, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.size === size
              ? { ...i, quantity: Math.max(1, quantity) }
              : i
          ),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),

      getCount: () =>
        get().items.reduce((count, item) => count + item.quantity, 0),
    }),
    {
      name: "mailand-cart",
      partialize: (state) => ({ items: state.items }), // don't persist isOpen
    }
  )
);

export default useCartStore;
