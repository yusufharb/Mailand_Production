"use client";

import { useCartStore } from "@/store/useCartStore";
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } =
    useCartStore();

  const total = getTotal();

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeCart]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-pink-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-primary" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Cart
                </h2>
                {items.length > 0 && (
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center pb-10">
                  <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="text-pink-300" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Discover our luxury body care collection.
                  </p>
                  <button
                    onClick={closeCart}
                    className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex gap-4 py-3 border-b border-gray-100 last:border-0"
                    >
                      {/* Image */}
                      <div className="w-18 h-18 flex-shrink-0 rounded-xl overflow-hidden bg-cream border border-pink-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {item.size}
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          EGP {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      {/* Qty + remove */}
                      <div className="flex flex-col items-end justify-between gap-2">
                        <button
                          onClick={() =>
                            removeItem(item.id, item.size)
                          }
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 text-sm">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="px-2 py-1 text-gray-500 hover:text-primary transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 font-medium min-w-[1.5rem] text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="px-2 py-1 text-gray-500 hover:text-primary transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-pink-100 bg-gray-50/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-900">
                    EGP {total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Shipping calculated at checkout
                </p>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white font-medium py-3.5 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Checkout
                  <ArrowRight size={16} />
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-gray-500 hover:text-primary mt-3 py-1 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
