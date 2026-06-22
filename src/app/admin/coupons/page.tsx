"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function CouponsPage() {
  const { coupons, addCoupon, toggleCouponStatus } = useAdminStore();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    usageLimit: 100,
    expirationDate: "",
    isActive: true,
    timesUsed: 0,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return;
    addCoupon({ ...form, code: form.code.toUpperCase() });
    toast.success("Coupon created!");
    setIsOpen(false);
    setForm({ code: "", type: "percentage", value: 0, usageLimit: 100, expirationDate: "", isActive: true, timesUsed: 0 });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-0.5">{coupons.length} promo codes</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="gap-2 shadow-sm">
          <Plus size={16} />
          New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => {
          const isExpired = new Date(coupon.expirationDate) < new Date();
          const usagePct = Math.min(100, Math.round((coupon.timesUsed / coupon.usageLimit) * 100));
          return (
            <Card key={coupon.id} className={`transition-all ${!coupon.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center">
                      <Tag size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 tracking-wider text-sm">
                        {coupon.code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {coupon.type === "percentage"
                          ? `${coupon.value}% off`
                          : `EGP ${coupon.value} off`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCouponStatus(coupon.id)}
                    className="text-gray-400 hover:text-primary transition-colors"
                    title={coupon.isActive ? "Deactivate" : "Activate"}
                  >
                    {coupon.isActive ? (
                      <ToggleRight size={22} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                  </button>
                </div>

                {/* Usage bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{coupon.timesUsed} used</span>
                    <span>{coupon.usageLimit} limit</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Expires{" "}
                    {new Date(coupon.expirationDate).toLocaleDateString()}
                  </span>
                  <Badge
                    variant={
                      !coupon.isActive || isExpired
                        ? "destructive"
                        : coupon.timesUsed >= coupon.usageLimit
                        ? "warning"
                        : "success"
                    }
                  >
                    {!coupon.isActive
                      ? "Inactive"
                      : isExpired
                      ? "Expired"
                      : coupon.timesUsed >= coupon.usageLimit
                      ? "Maxed"
                      : "Active"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {coupons.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400">
            <Tag size={32} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No coupons yet. Create one!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Coupon">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code
            </label>
            <Input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SUMMER20"
              className="uppercase"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })}
                className="w-full h-9 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (EGP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <Input
                required
                type="number"
                min="1"
                value={form.value || ""}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                placeholder={form.type === "percentage" ? "e.g. 15" : "e.g. 50"}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Limit
              </label>
              <Input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <Input
                required
                type="date"
                value={form.expirationDate}
                onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Coupon</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
