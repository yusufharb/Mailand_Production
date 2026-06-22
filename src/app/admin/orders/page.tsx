"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Search, Eye, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useAdminStore();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered": return "success";
      case "Pending": return "warning";
      case "Shipped": return "secondary";
      case "Cancelled": return "destructive";
      default: return "default";
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const msg = `Hello ${name}, regarding your Mailand order...`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">Manage and process customer orders.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by Order ID or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-medium text-gray-500">
                  <th className="pb-3 pl-4">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pl-4 font-medium text-gray-900">{order.id}</td>
                    <td className="py-4">
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.phone}</p>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="py-4 text-sm font-medium text-gray-900">EGP {order.totalPrice}</td>
                    <td className="py-4">
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                          <Eye size={16} className="text-gray-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleWhatsApp(order.phone, order.customerName)}>
                          <MessageCircle size={16} className="text-green-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order Details: ${selectedOrder?.id}`}>
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{selectedOrder.customerName}</p>
                <p className="text-gray-600">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Delivery Address</p>
                <p className="font-medium text-gray-900">{selectedOrder.address}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-2">Order Items</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {selectedOrder.products.map((p: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{p.quantity}x {p.name} ({p.size})</span>
                    <span className="font-medium">EGP {p.price * p.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>EGP {selectedOrder.totalPrice}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <div className="flex gap-2">
                <select 
                  className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={selectedOrder.status}
                  onChange={(e) => {
                    updateOrderStatus(selectedOrder.id, e.target.value as "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled");
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <Button onClick={() => handleWhatsApp(selectedOrder.phone, selectedOrder.customerName)} className="bg-green-500 hover:bg-green-600">
                  <MessageCircle size={18} className="mr-2" /> Notify
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
