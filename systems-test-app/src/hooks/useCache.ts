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
  const [cacheUpdateLoading, setCacheUpdateLoading] = useState(false);
  const [cacheUpdateError, setCacheUpdateError] = useState<string | null>(null);
  const [cacheUpdateSuccess, setcacheUpdateSuccess] = useState(false);
  const [employee] = useAtom(employeeAtom);
  const [, setCart] = useAtom(cartAtom);

  async function updateCacheAndQueue(sales: SalePayload[]) {
    if (!employee?.store_id) {
      setCacheUpdateError("Missing store information");
      return;
    }

    setCacheUpdateLoading(true);
    setCacheUpdateError(null);
    setcacheUpdateSuccess(false);

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
        setCacheUpdateError(data.cacheUpdateError || "Failed to update cache");
        return;
      }

      setcacheUpdateSuccess(true);
      setCart([]); // Clear cart on cacheUpdateSuccess
    } catch (err) {
      setCacheUpdateError("Network cacheUpdateError while updating cache");
    } finally {
      setCacheUpdateLoading(false);
    }
  }

  return {
    updateCacheAndQueue,
    cacheUpdateLoading,
    cacheUpdateError,
    cacheUpdateSuccess,
  };
}
