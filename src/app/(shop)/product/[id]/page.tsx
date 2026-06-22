"use client";

import { useState, useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import {
  ShoppingBag,
  Star,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ProductCard from "@/components/product/ProductCard";

export default function ProductDetails() {
  const params = useParams();
  const id = params.id as string;
  const { products } = useProductStore();
  const product = products.find((p) => p.id === id);
  const { addItem, openCart } = useCartStore();

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (product) {
      setSelectedSize(product.sizes?.[0] || "Standard");
    }
  }, [product]);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-gray-100 rounded-3xl aspect-square" />
          <div className="space-y-4">
            <div className="h-3 bg-gray-100 rounded w-1/4" />
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-20 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-4 text-gray-900">
            Product not found
          </h1>
          <p className="text-gray-500 mb-6">
            This product may have been removed or doesn't exist.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images[0] || "",
      size: selectedSize,
      quantity,
    });
    toast.success("Added to cart! 🛍");
    openCart();
  };

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 4.8;

  const discountPercent = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : null;

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category && p.isVisible !== false)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium line-clamp-1 max-w-[200px]">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
        {/* Image Gallery */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative bg-cream rounded-3xl overflow-hidden aspect-square group">
            {product.images.length > 0 ? (
              <img
                src={product.images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-pink-50 text-pink-200">
                <ShoppingBag size={60} />
              </div>
            )}
            {discountPercent && (
              <div className="absolute top-4 left-4 bg-primary text-white font-bold px-4 py-2 rounded-full text-sm shadow-sm">
                -{discountPercent}% OFF
              </div>
            )}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage((i) =>
                      i === 0 ? product.images.length - 1 : i - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((i) =>
                      i === product.images.length - 1 ? 0 : i + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    currentImage === i
                      ? "border-primary shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`View ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-rosegold uppercase tracking-widest mb-2">
            {product.category}
          </span>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-3 leading-tight">
            {product.name}
          </h1>

          {/* Stars */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={
                    s <= Math.round(avgRating)
                      ? "text-amber-400"
                      : "text-gray-200"
                  }
                  fill={s <= Math.round(avgRating) ? "currentColor" : "none"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {avgRating.toFixed(1)} ({product.reviews.length || "12"} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-gray-900">
              EGP{" "}
              {(product.discountPrice || product.price).toLocaleString()}
            </span>
            {product.discountPrice && (
              <span className="text-xl text-gray-400 line-through">
                EGP {product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6 border-b border-gray-100 pb-6">
            {product.description}
          </p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-5 text-sm">
            {product.stock > 10 ? (
              <>
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-green-700 font-medium">In Stock</span>
                <span className="text-gray-400">
                  ({product.stock} available)
                </span>
              </>
            ) : product.stock > 0 ? (
              <>
                <CheckCircle size={16} className="text-amber-500" />
                <span className="text-amber-700 font-medium">
                  Low Stock — Only {product.stock} left
                </span>
              </>
            ) : (
              <>
                <CheckCircle size={16} className="text-gray-400" />
                <span className="text-gray-500 font-medium">Out of Stock</span>
              </>
            )}
          </div>

          {/* Size selector */}
          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 rounded-full border text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty + CTA */}
          <div className="flex gap-3 mb-6">
            <div className="flex items-center border border-gray-200 rounded-full bg-white shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-gray-600 hover:text-primary transition-colors text-lg"
              >
                −
              </button>
              <span className="px-4 font-semibold min-w-[3ch] text-center">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(product.stock || 99, quantity + 1))
                }
                className="px-4 py-3 text-gray-600 hover:text-primary transition-colors text-lg"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-gray-900 disabled:bg-gray-300 text-white font-medium rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 py-3.5 shadow-sm hover:shadow-md"
            >
              <ShoppingBag size={18} />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <button
              onClick={() => {
                setIsWishlisted((w) => !w);
                toast.success(
                  isWishlisted ? "Removed from wishlist" : "Added to wishlist ♡"
                );
              }}
              className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                isWishlisted
                  ? "border-red-300 bg-red-50 text-red-500"
                  : "border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:text-red-500"
              }`}
              aria-label="Add to wishlist"
            >
              <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Delivery perks */}
          <div className="bg-cream rounded-2xl p-4 space-y-2.5 text-sm text-gray-600">
            {[
              "✓ Free shipping on orders over EGP 1000",
              "✓ 100% cruelty-free & vegan ingredients",
              "✓ Easy returns within 14 days",
              "✓ Order via WhatsApp — fast & simple",
            ].map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mb-20">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
            Customer Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-cream rounded-2xl p-5 border border-pink-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                      {review.customerName.charAt(0)}
                    </div>
                    <p className="font-medium text-gray-900 text-sm">
                      {review.customerName}
                    </p>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={
                          s <= review.rating
                            ? "text-amber-400"
                            : "text-gray-200"
                        }
                        fill={s <= review.rating ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic">
                  "{review.comment}"
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(review.createdAt).toLocaleDateString("en-EG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
