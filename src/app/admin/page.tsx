"use client";

import { useProductStore } from "@/store/useProductStore";
import { useAdminStore } from "@/store/useAdminStore";
import { chartData } from "@/lib/mock/adminData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Package, ShoppingBag, Users, DollarSign,
  TrendingUp, TrendingDown, AlertCircle, ArrowRight,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import Link from "next/link";

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const STATUS_COLORS: Record<string, string> = {
  Delivered: "text-green-600 bg-green-50",
  Pending:   "text-yellow-600 bg-yellow-50",
  Shipped:   "text-blue-600 bg-blue-50",
  Confirmed: "text-indigo-600 bg-indigo-50",
  Cancelled: "text-red-500 bg-red-50",
};

export default function AdminDashboard() {
  const { products } = useProductStore();
  const { orders, customers } = useAdminStore();

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((acc, o) => acc + o.totalPrice, 0);

  const stats = [
    {
      title: "Total Revenue",
      value: `EGP ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: "+12.5%",
      up: true,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      trend: "+5.2%",
      up: true,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Products",
      value: products.filter((p) => p.isVisible !== false).length,
      icon: Package,
      trend: "+2",
      up: true,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      title: "Total Customers",
      value: customers.length,
      icon: Users,
      trend: "+18.2%",
      up: true,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < 10);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-semibold ${
                      stat.up ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {stat.up ? (
                      <TrendingUp size={13} />
                    ) : (
                      <TrendingDown size={13} />
                    )}
                    {stat.trend}
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData.revenueByMonth}
                    margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      dx={-8}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        fontSize: "13px",
                      }}
                      formatter={(v) => [`EGP ${(v as number)?.toLocaleString() ?? v}`, "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#FFB6C1"
                      strokeWidth={2.5}
                      dot={{ r: 3, strokeWidth: 2, fill: "#fff", stroke: "#FFB6C1" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Weekly Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData.ordersByWeek}
                    margin={{ top: 5, right: 0, bottom: 5, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        fontSize: "13px",
                      }}
                    />
                    <Bar dataKey="orders" fill="#86efac" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent orders + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Link
                href="/admin/orders"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View all <ArrowRight size={13} />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No orders yet.</p>
                ) : (
                  recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-3.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-pink-50 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {order.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {order.id} ·{" "}
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          EGP {order.totalPrice.toLocaleString()}
                        </p>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            STATUS_COLORS[order.status] || "text-gray-500 bg-gray-50"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <CardTitle className="text-red-600">Low Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockProducts.length === 0 ? (
                  <p className="text-sm text-gray-400 py-6 text-center">
                    All products well stocked ✓
                  </p>
                ) : (
                  lowStockProducts.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {p.name}
                        </p>
                        <p className="text-xs text-red-600 font-semibold mt-0.5">
                          {p.stock} remaining
                        </p>
                      </div>
                      <Link
                        href="/admin/products"
                        className="ml-2 text-xs bg-white border border-red-200 text-red-600 px-2.5 py-1 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        Edit
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
