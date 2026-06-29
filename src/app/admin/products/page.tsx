"use client";

import { useState } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useAdminStore } from "@/store/useAdminStore";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Plus, Search, Edit2, Trash2, Image as ImageIcon,
  Star, Eye, EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const CATEGORY_OPTIONS = ["Lotion", "Spray", "Serum", "Scrub", "Oil", "Mask", "Other"];
const SIZE_OPTIONS = ["50ml", "100ml", "150ml", "200ml", "250ml", "300ml", "500ml", "Standard"];

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: 0,
  discountPrice: undefined as number | undefined,
  stock: 0,
  images: [] as string[],
  sizes: [] as string[],
  isFeatured: false,
  isVisible: true,
};

export default function ProductsPage() {
  const { products, toggleFeatured, toggleVisibility } = useProductStore();
  const { addProduct, updateProduct, deleteProduct } = useAdminStore();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [imageUrl, setImageUrl] = useState("");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (product?: (typeof products)[0]) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        images: product.images || [],
        sizes: product.sizes || [],
        isFeatured: product.isFeatured ?? false,
        isVisible: product.isVisible ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm });
    }
    setImageUrl("");
    setIsModalOpen(true);
  };

  const handleAddImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    setFormData((f) => ({ ...f, images: [...f.images, url] }));
    setImageUrl("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading("Uploading image to storage...");
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload");

      setFormData((f) => ({ ...f, images: [...f.images, data.url] }));
      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image", { id: toastId });
    }
  };

  const handleRemoveImage = (i: number) =>
    setFormData((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const handleToggleSize = (size: string) =>
    setFormData((f) => ({
      ...f,
      sizes: f.sizes.includes(size)
        ? f.sizes.filter((s) => s !== size)
        : [...f.sizes, size],
    }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      sizes: formData.sizes.length > 0 ? formData.sizes : ["Standard"],
      reviews: [],
    };
    if (editingId) {
      updateProduct(editingId, payload as any);
      toast.success("Product updated!");
    } else {
      addProduct(payload as any);
      toast.success("Product added!");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteProduct(id);
      toast.success("Product deleted.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} total · {products.filter((p) => p.isVisible !== false).length} visible
          </p>
        </div>
        <Button onClick={() => handleOpen()} className="gap-2 shadow-sm">
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search by name or category..."
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
                  <th className="pb-3 pt-1 pl-5">Product</th>
                  <th className="pb-3 pt-1">Category</th>
                  <th className="pb-3 pt-1">Price</th>
                  <th className="pb-3 pt-1">Stock</th>
                  <th className="pb-3 pt-1">Status</th>
                  <th className="pb-3 pt-1 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                    {/* Product */}
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {product.sizes?.join(", ") || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 text-sm text-gray-600">{product.category}</td>

                    {/* Price */}
                    <td className="py-3.5">
                      <span className="text-sm font-semibold text-gray-900">
                        EGP {(product.discountPrice || product.price).toLocaleString()}
                      </span>
                      {product.discountPrice && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">
                          EGP {product.price}
                        </span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5">
                      <Badge
                        variant={
                          product.stock > 10
                            ? "success"
                            : product.stock > 0
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
                      </Badge>
                    </td>

                    {/* Status toggles */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Featured */}
                        <button
                          onClick={() => toggleFeatured(product.id)}
                          title={product.isFeatured ? "Remove from featured" : "Mark as featured"}
                          className={`p-1.5 rounded-lg transition-all ${
                            product.isFeatured
                              ? "text-amber-500 bg-amber-50"
                              : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"
                          }`}
                        >
                          <Star size={15} fill={product.isFeatured ? "currentColor" : "none"} />
                        </button>

                        {/* Visible */}
                        <button
                          onClick={() => toggleVisibility(product.id)}
                          title={product.isVisible !== false ? "Hide product" : "Show product"}
                          className={`p-1.5 rounded-lg transition-all ${
                            product.isVisible !== false
                              ? "text-green-500 bg-green-50"
                              : "text-gray-300 hover:text-green-400 hover:bg-green-50"
                          }`}
                        >
                          {product.isVisible !== false ? (
                            <Eye size={15} />
                          ) : (
                            <EyeOff size={15} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-5">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpen(product)}
                          className="h-8 w-8"
                        >
                          <Edit2 size={14} className="text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="h-8 w-8"
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400 text-sm">
                      {search
                        ? "No products match your search."
                        : "No products yet. Click 'Add Product' to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            {formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.images.map((src, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group"
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Paste image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddImageUrl}>
                Add URL
              </Button>
            </div>
            <div className="relative">
              <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 cursor-pointer hover:border-primary hover:text-primary transition-colors bg-gray-50 hover:bg-pink-50/30">
                <ImageIcon size={16} />
                Upload from device
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Soft Rose Body Lotion"
            />
          </div>

          {/* Category + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-9 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select...</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (EGP) *
              </label>
              <Input
                required
                type="number"
                min="0"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Discount + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price (EGP)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.discountPrice ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountPrice: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <Input
                required
                type="number"
                min="0"
                value={formData.stock || ""}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Sizes
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleToggleSize(size)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    formData.sizes.includes(size)
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the product..."
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">
                ⭐ Featured on homepage
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">👁 Visible in store</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingId ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
