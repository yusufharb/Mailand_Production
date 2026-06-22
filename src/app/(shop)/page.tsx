"use client";

import ProductCard from "@/components/product/ProductCard";
import { useProductStore } from "@/store/useProductStore";
import { useAdminStore } from "@/store/useAdminStore";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Leaf, Star, ShieldCheck } from "lucide-react";

const GALLERY_IDS = [
  "1612817288484-1c86b2325528",
  "1596462502278-27bfdc403348",
  "1556228578-0d85b1a4d571",
  "1598440947619-22522851991a",
];

const TESTIMONIALS = [
  {
    name: "Aya M.",
    location: "Cairo",
    text: "The Soft Rose Lotion is pure luxury. My skin has never been softer and the scent lasts all day.",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Nouran S.",
    location: "Alexandria",
    text: "I order every month now! The Vanilla Dreams spray is my signature scent. Everyone asks what I'm wearing.",
    rating: 5,
    avatar: "N",
  },
  {
    name: "Habiba K.",
    location: "Zamalek",
    text: "Finally a local brand that rivals international luxury. The packaging is beautiful and the products work.",
    rating: 5,
    avatar: "H",
  },
];

const VALUES = [
  {
    icon: Leaf,
    title: "100% Cruelty-Free",
    desc: "Never tested on animals. Always kind.",
  },
  {
    icon: Sparkles,
    title: "Premium Formulas",
    desc: "Dermatologist-tested luxury ingredients.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Vegan",
    desc: "No parabens. No sulfates. Just pure care.",
  },
  {
    icon: Star,
    title: "5-Star Rated",
    desc: "Loved by thousands of glowing customers.",
  },
];

export default function Home() {
  const { products } = useProductStore();
  const { siteSettings } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hero = siteSettings.hero;

  const visibleProducts = products.filter((p) => p.isVisible !== false);
  const featuredProducts = visibleProducts
    .filter((p) => p.isFeatured)
    .slice(0, 4);

  // Fallback: show newest 4 if none are featured
  const displayProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : [...visibleProducts]
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime()
          )
          .slice(0, 4);

  const categories = ["All", ...Array.from(new Set(visibleProducts.map((p) => p.category)))];

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[88vh] flex items-center bg-cream overflow-hidden">
        {/* BG image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-25 pointer-events-none"
          style={{ backgroundImage: `url('${hero.image}')` }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-cream via-cream/90 to-transparent pointer-events-none" />
        {/* Decorative circle */}
        <div className="absolute top-1/2 right-[-200px] -translate-y-1/2 w-[700px] h-[700px] bg-pink-100 rounded-full blur-3xl opacity-40 pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 text-rosegold font-semibold tracking-widest uppercase text-xs mb-6 bg-pink-50 px-4 py-2 rounded-full">
              <Sparkles size={12} />
              New Collection
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-[1.1] whitespace-pre-line">
              {hero.title}
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-md leading-relaxed">
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={hero.ctaLink}
                className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white font-medium px-8 py-4 rounded-full hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {hero.ctaText}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-medium px-8 py-4 rounded-full hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                View All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values strip ─── */}
      <section className="bg-white border-y border-pink-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left"
              >
                <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-rosegold" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Category pills ─── */}
      <section className="py-12 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === "All" ? "/products" : `/products?category=${cat}`}
                className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary transition-colors flex-shrink-0 shadow-sm"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-semibold text-rosegold uppercase tracking-widest">
                Trending Now
              </span>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mt-1">
                Most Loved
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {!mounted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 aspect-square rounded-2xl mb-4" />
                  <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <p className="text-gray-500">
                No products yet. Add some from the{" "}
                <Link href="/admin" className="text-primary hover:underline">
                  Admin Dashboard
                </Link>
                !
              </p>
            </div>
          )}

          <div className="sm:hidden text-center mt-8">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 border border-gray-200 px-6 py-3 rounded-full hover:border-primary hover:text-primary transition-colors"
            >
              View all products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Brand story banner ─── */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=800"
                  alt="Mailand brand story"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-5 shadow-xl border border-pink-50">
                <p className="text-3xl font-serif font-bold text-rosegold">
                  5★
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  From 1000+ reviews
                </p>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold text-rosegold uppercase tracking-widest">
                Our Story
              </span>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mt-3 mb-5 leading-tight">
                Beauty rooted in
                <br />
                <em className="text-rosegold not-italic">self-love</em>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Mailand was born from a simple belief: every person deserves to
                feel luxurious in their own skin, every single day. We craft our
                body care collection with the finest ingredients, blending
                ancient botanicals with modern science to deliver results you can
                feel.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                From the first drop of our rose body lotion to the last spritz of
                vanilla mist, every product is a love letter to your skin.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-rosegold text-white font-medium px-7 py-3.5 rounded-full hover:bg-rosegold/90 transition-all duration-200 shadow-lg shadow-pink-200/50"
              >
                Explore Our World <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-rosegold uppercase tracking-widest">
              Real Results
            </span>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mt-2">
              What Our Community Says
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, location, text, rating, avatar }) => (
              <div
                key={name}
                className="bg-cream rounded-2xl p-6 border border-pink-50 hover:shadow-md transition-shadow"
              >
                <div className="flex mb-4">
                  {[...Array(rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-amber-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social gallery ─── */}
      <section className="py-16 bg-pink-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-3">
            <div>
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                #MailandGlow
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Join our community of glowing beauties.
              </p>
            </div>
            <a
              href="#"
              className="text-sm font-medium text-rosegold hover:text-primary transition-colors flex items-center gap-1"
            >
              Follow us <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {GALLERY_IDS.map((id, i) => (
              <div
                key={i}
                className="relative aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=400&h=700`}
                  alt="Community post"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-xs font-medium">
                    @mailand
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Newsletter ─── */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold text-pink-300 uppercase tracking-widest mb-4 block">
            Stay in the glow
          </span>
          <h2 className="text-3xl font-serif font-bold mb-4">
            Get 10% off your first order
          </h2>
          <p className="text-gray-400 mb-8 text-sm leading-relaxed">
            Subscribe for exclusive offers, new arrivals, and beauty tips —
            straight to your inbox.
          </p>
          {subscribed ? (
            <div className="bg-white/10 rounded-2xl py-4 px-6 inline-block">
              <p className="text-pink-300 font-medium">
                🌸 You're on the list! Check your inbox.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary focus:bg-white/15 text-sm transition-all"
              />
              <button
                onClick={() => {
                  if (email) setSubscribed(true);
                }}
                className="px-7 py-3.5 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
