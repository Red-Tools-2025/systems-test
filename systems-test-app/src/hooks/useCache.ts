// src/hooks/useCache.ts
import { useState } from "react";
import { useAtom } from "jotai";
import { cartAtom } from "@/atoms/cart";
import { employeeAtom } from "@/atoms/auth";

interface SalePayload {
  p_id: number;
  quantity: number;
}

export function useCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [employee] = useAtom(employeeAtom);
  const [, setCart] = useAtom(cartAtom);

  async function updateCacheAndQueue(sales: SalePayload[]) {
    if (!employee?.store_id) {
      setError("Missing store information");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/pos/cache-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sales,
          storeId: employee.store_id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update cache");
        return;
      }

      setSuccess(true);
      setCart([]); // Clear cart on success
    } catch (err) {
      setError("Network error while updating cache");
    } finally {
      setLoading(false);
    }
  }

  return {
    updateCacheAndQueue,
    loading,
    error,
    success,
  };
}
