"use client";

import { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Search, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function CustomersPage() {
  const { customers } = useAdminStore();
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {customers.length} total customers
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="pb-3 pt-1 pl-5">Customer</th>
                  <th className="pb-3 pt-1">Phone</th>
                  <th className="pb-3 pt-1 text-center">Orders</th>
                  <th className="pb-3 pt-1">Total Spent</th>
                  <th className="pb-3 pt-1 pr-5">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/15 rounded-full flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          {customer.email && (
                            <p className="text-xs text-gray-400">{customer.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-sm text-gray-600">{customer.phone}</td>
                    <td className="py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="py-3.5 text-sm font-semibold text-gray-900">
                      EGP {customer.totalSpending.toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-5 text-sm text-gray-500">
                      {new Date(customer.lastOrderDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Users size={32} className="text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No customers found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
