import { mockProducts } from '@/lib/data';

export const initialAdminData = {
  products: mockProducts,
  orders: [
    {
      id: "ORD-1001",
      customerName: "Aya M.",
      phone: "+201012345678",
      address: "Nasr City, Cairo, Egypt",
      totalPrice: 1250,
      status: "Delivered",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      products: [
        { name: "Mailand Soft Rose Body Lotion", quantity: 2, price: 380, size: "250ml" },
        { name: "Vanilla Dreams Body Spray", quantity: 1, price: 320, size: "100ml" }
      ],
      paymentMethod: "WhatsApp / COD"
    },
    {
      id: "ORD-1002",
      customerName: "Nouran S.",
      phone: "+201123456789",
      address: "Zamalek, Cairo, Egypt",
      totalPrice: 450,
      status: "Pending",
      date: new Date().toISOString(),
      products: [
        { name: "Glow & Hydrate Cream", quantity: 1, price: 450, size: "200ml" }
      ],
      paymentMethod: "WhatsApp / COD"
    },
    {
      id: "ORD-1003",
      customerName: "Habiba K.",
      phone: "+201234567890",
      address: "Smouha, Alexandria, Egypt",
      totalPrice: 700,
      status: "Shipped",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      products: [
        { name: "Mailand Soft Rose Body Lotion", quantity: 1, price: 380, size: "150ml" },
        { name: "Vanilla Dreams Body Spray", quantity: 1, price: 320, size: "200ml" }
      ],
      paymentMethod: "WhatsApp / COD"
    }
  ],
  customers: [
    {
      id: "C-001",
      name: "Aya M.",
      email: "aya@example.com",
      phone: "+201012345678",
      totalOrders: 4,
      totalSpending: 3450,
      lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "C-002",
      name: "Nouran S.",
      email: "nouran@example.com",
      phone: "+201123456789",
      totalOrders: 1,
      totalSpending: 450,
      lastOrderDate: new Date().toISOString()
    },
    {
      id: "C-003",
      name: "Habiba K.",
      email: "habiba@example.com",
      phone: "+201234567890",
      totalOrders: 2,
      totalSpending: 1200,
      lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  coupons: [
    {
      id: "CPN-01",
      code: "MAILAND10",
      type: "percentage",
      value: 10,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: 100,
      timesUsed: 42,
      isActive: true
    },
    {
      id: "CPN-02",
      code: "WELCOME50",
      type: "fixed",
      value: 50,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      usageLimit: 50,
      timesUsed: 50,
      isActive: false
    }
  ]
};

export const chartData = {
  revenueByMonth: [
    { name: 'Jan', total: 2400 },
    { name: 'Feb', total: 1398 },
    { name: 'Mar', total: 4800 },
    { name: 'Apr', total: 3908 },
    { name: 'May', total: 4800 },
    { name: 'Jun', total: 3800 },
    { name: 'Jul', total: 4300 },
  ],
  ordersByWeek: [
    { name: 'Week 1', orders: 12 },
    { name: 'Week 2', orders: 19 },
    { name: 'Week 3', orders: 15 },
    { name: 'Week 4', orders: 25 },
  ]
};
