export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  images: string[];
  sizes: string[];
  stock: number;
  reviews: Review[];
  isFeatured?: boolean;
  isVisible?: boolean;
  createdAt?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
  products: OrderItem[];
  paymentMethod: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpending: number;
  lastOrderDate: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expirationDate: string;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export interface SiteSettings {
  hero: {
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    ctaLink: string;
  };
  footer: {
    about: string;
    links: { title: string; url: string }[];
    social: {
      instagram: string;
      twitter: string;
      facebook: string;
      tiktok?: string;
    };
  };
}
