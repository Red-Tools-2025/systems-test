// src/hooks/useCache.ts
"use client";
import { useEffect, useState } from "react";
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
  const [salesEventSource, setSalesEventSource] = useState<EventSource | null>(
    null
  );
  const [employee] = useAtom(employeeAtom);
  const [, setCart] = useAtom(cartAtom);

  // Updating and publishing messages for sales cache
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

  // Declaring an event source
  // Set up SSE connection once on mount
  useEffect(() => {
    if (!employee?.store_id) return;

    const source = new EventSource(
      `/api/event-source/pos?storeId=${employee.store_id}`
    );
    setSalesEventSource(source);

    source.onopen = () => {
      console.log("SSE connection opened");
    };

    source.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        console.log("Received update via SSE:", update);
      } catch (err) {
        console.error("Failed to parse SSE message:", err);
      }
    };

    source.onerror = (event) => {
      console.error("EventSource error:", event);
      // Don't immediately close - let it retry
      if (source.readyState === EventSource.CLOSED) {
        setSalesEventSource(null);
      }
    };

    return () => {
      source.close();
      setSalesEventSource(null);
    };
  }, [employee?.store_id]);

  return {
    updateCacheAndQueue,
    salesEventSource,
    cacheUpdateLoading,
    cacheUpdateError,
    cacheUpdateSuccess,
  };
}
