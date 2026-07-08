"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAdminStore } from "@/store/useAdminStore";
import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, Tag, ArrowLeft, ShoppingBag, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { items, getTotal, updateQuantity, removeItem, clearCart } = useCartStore();
  const { coupons } = useAdminStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<(typeof coupons)[0] | null>(null);
  const [promoError, setPromoError] = useState("");

  const subtotal = getTotal();
  const shipping = subtotal >= 1000 ? 0 : 50;

  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount =
      appliedCoupon.type === "percentage"
        ? subtotal * (appliedCoupon.value / 100)
        : appliedCoupon.value;
  }

  const total = Math.max(0, subtotal - discountAmount) + (items.length > 0 ? shipping : 0);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    const coupon = coupons.find(
      (c) => c.code.toLowerCase() === promoCode.trim().toLowerCase()
    );
    if (!coupon) {
      setPromoError("Invalid promo code");
      setAppliedCoupon(null);
      return;
    }
    if (!coupon.isActive) {
      setPromoError("This code is no longer active");
      setAppliedCoupon(null);
      return;
    }
    if (coupon.timesUsed >= coupon.usageLimit) {
      setPromoError("This code has reached its usage limit");
      setAppliedCoupon(null);
      return;
    }
    if (new Date(coupon.expirationDate) < new Date()) {
      setPromoError("This code has expired");
      setAppliedCoupon(null);
      return;
    }
    setPromoError("");
    setAppliedCoupon(coupon);
    setPromoCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            fullName: formData.fullName,
            phone:    formData.phone,
            address:  formData.address,
            notes:    formData.notes,
          },
          items: items.map((item) => ({
            product_id: item.id,
            name:       item.name,
            size:       item.size,
            quantity:   item.quantity,
            price:      item.price,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to place order");

      clearCart();
      setOrderNumber(json.orderNumber);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────
  if (orderNumber) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-3xl font-serif font-bold mb-2 text-gray-900">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-500 mb-1 text-sm">
          Your order reference number:
        </p>
        <p className="text-xl font-bold text-primary mb-6 tracking-wide">
          {orderNumber}
        </p>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
          Thank you for shopping with Mailand Cosmetics.
          We will contact you shortly to confirm your order.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
      </div>
    );
  }

  // ── Empty cart screen ────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-pink-300" />
        </div>
        <h2 className="text-3xl font-serif font-bold mb-3 text-gray-900">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-8">
          Add some products to get started.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full font-medium hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={16} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Continue Shopping
        </Link>
        <h1 className="text-3xl font-serif font-bold text-gray-900">
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
        {/* Shipping form */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            Shipping Details
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Aya Mohamed"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+20 1XX XXX XXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Delivery Address
              </label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Street, Building, City, Governorate"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Order Notes{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any special instructions..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? "Placing Order..." : "Confirm Order"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Cash on Delivery — no payment needed now.
            </p>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">
              Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-4 mb-5">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="flex items-start gap-3"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.size}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex items-center border border-gray-200 rounded-full bg-white text-xs">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.size, item.quantity - 1)
                          }
                          className="px-2 py-1 text-gray-400 hover:text-primary"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="px-1.5 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.size, item.quantity + 1)
                          }
                          className="px-2 py-1 text-gray-400 hover:text-primary"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    EGP {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary/30 text-sm outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-red-500 text-xs mt-1.5">{promoError}</p>
              )}
              {appliedCoupon && (
                <div className="flex items-center justify-between mt-2.5 p-2.5 bg-green-50 text-green-700 rounded-xl text-xs border border-green-100">
                  <span>
                    <strong>{appliedCoupon.code}</strong> applied (−EGP{" "}
                    {discountAmount.toFixed(2)})
                  </span>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="hover:text-green-900 ml-2"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>EGP {subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>−EGP {discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    `EGP ${shipping}`
                  )}
                </span>
              </div>
              {subtotal < 1000 && (
                <p className="text-xs text-gray-400">
                  Add EGP {(1000 - subtotal).toLocaleString()} more for free
                  shipping
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>EGP {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
