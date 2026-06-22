"use client";

import Link from "next/link";
import { ShoppingBag, Star, Heart } from "lucide-react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0] || "",
      size: product.sizes?.[0] || "Standard",
      quantity: 1,
    });
    toast.success("Added to cart!");
    setTimeout(() => {
      setAdding(false);
      openCart();
    }, 400);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsWishlisted((w) => !w);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist ♡");
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-pink-100/50 transition-all duration-300 border border-pink-50/80">
      {/* Image container */}
      <Link
        href={`/product/${product.id}`}
        className="block relative overflow-hidden bg-cream"
        style={{ paddingTop: "100%" }}
      >
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-pink-50 text-pink-200">
            <ShoppingBag size={40} />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPercent && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-900 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
          {product.stock > 0 && product.stock < 10 && (
            <span className="bg-amber-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              Low Stock
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 opacity-0 group-hover:opacity-100 ${
            isWishlisted
              ? "bg-red-50 text-red-500"
              : "bg-white/90 text-gray-400 hover:text-red-500"
          }`}
          aria-label="Add to wishlist"
        >
          <Heart size={15} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] font-semibold text-rosegold uppercase tracking-widest mb-1.5">
          {product.category}
        </span>

        <Link href={`/product/${product.id}`} className="flex-grow">
          <h3 className="text-sm font-medium text-gray-900 hover:text-primary transition-colors leading-snug line-clamp-2 mb-3">
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        {product.reviews.length > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                className="text-amber-400"
                fill="currentColor"
              />
            ))}
            <span className="text-xs text-gray-400 ml-1">
              ({product.reviews.length})
            </span>
          </div>
        )}

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-gray-900">
              EGP {(product.discountPrice || product.price).toLocaleString()}
            </span>
            {product.discountPrice && (
              <span className="text-xs text-gray-400 line-through">
                EGP {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
              product.stock === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : adding
                ? "bg-primary text-white scale-90"
                : "bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-110"
            }`}
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
