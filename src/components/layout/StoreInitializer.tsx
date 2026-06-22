"use client";

import { useEffect, useRef } from "react";
import { useProductStore } from "@/store/useProductStore";
import { useAdminStore } from "@/store/useAdminStore";

export default function StoreInitializer() {
  const initialized = useRef(false);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const fetchSettings = useAdminStore((state) => state.fetchSettings);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchProducts();
      fetchSettings();
    }
  }, [fetchProducts, fetchSettings]);

  return null;
}
