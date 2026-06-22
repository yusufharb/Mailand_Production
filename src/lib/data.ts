import type { Product } from "@/types";

export type { Product };

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Mailand Soft Rose Body Lotion",
    description:
      "A deeply nourishing body lotion with a delicate rose fragrance. Enriched with hyaluronic acid and rose hip oil, it leaves your skin feeling silky smooth and radiantly glowing for up to 24 hours.",
    category: "Lotion",
    price: 450,
    discountPrice: 380,
    images: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800",
    ],
    sizes: ["150ml", "250ml"],
    stock: 50,
    isFeatured: true,
    isVisible: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [
      {
        id: "r1",
        customerName: "Aya M.",
        rating: 5,
        comment: "Smells divine and absorbs so quickly! My skin has never felt better.",
        createdAt: "2024-05-10T10:00:00Z",
      },
      {
        id: "r2",
        customerName: "Habiba K.",
        rating: 5,
        comment: "Best lotion I've ever used. The rose scent is subtle and elegant.",
        createdAt: "2024-06-01T08:30:00Z",
      },
    ],
  },
  {
    id: "p2",
    name: "Vanilla Dreams Body Spray",
    description:
      "A long-lasting, refreshing body mist with notes of sweet vanilla and warm amber. This ethereal fragrance lingers on the skin all day, leaving a soft, sensual trail wherever you go.",
    category: "Spray",
    price: 320,
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800",
    ],
    sizes: ["100ml", "200ml"],
    stock: 120,
    isFeatured: true,
    isVisible: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [],
  },
  {
    id: "p3",
    name: "Glow & Hydrate Cream",
    description:
      "Our signature rich body cream that locks in moisture for 24 hours. Infused with shea butter, vitamin E, and our proprietary glow complex for visibly luminous skin.",
    category: "Lotion",
    price: 500,
    discountPrice: 450,
    images: [
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800",
    ],
    sizes: ["200ml"],
    stock: 30,
    isFeatured: true,
    isVisible: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [],
  },
  {
    id: "p4",
    name: "Coconut Breeze Mist",
    description:
      "Transport yourself to a tropical paradise with this light, summery body spray. A fusion of fresh coconut, white florals, and sea salt for an instant mood boost.",
    category: "Spray",
    price: 290,
    images: [
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800",
    ],
    sizes: ["150ml"],
    stock: 200,
    isFeatured: true,
    isVisible: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviews: [],
  },
];
