// src/hooks/useInventory.ts
import { useEffect, useState } from "react";
import type { Inventory } from "@/types/db";

export function useInventory(storeId?: number) {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/inventory?store_id=${storeId}`)
      .then(async (res) => {
        const data: { inventory?: Inventory[]; error?: string } =
          await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch inventory");
        setInventory(data.inventory || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // for event sourcing
    // console.log(`Setting up SSE for store ${storeId}`);
    // const source = new EventSource(`/api/event-source/pos?storeId=${storeId}`);

    // source.onopen = () => {
    //   console.log("SSE Established and opened");
    // };

    // source.onmessage = (event) => {
    //   try {
    //     const updates: { p_id: number; quantity: number }[] = JSON.parse(
    //       event.data
    //     );

    //     // Update the existing inventory state
    //     setInventory((prev) => prev.map((item) => {
    //       const soldItem = updates.find((x) => x.p_id === item.id)
    //       const newQty = Math.max(item.quantity - )
    //       return item
    //     }))
    //   } catch (err) {
    //     console.error("Failed to parse SSE message:", err);
    //     console.error("Raw message data:", event.data);
    //   }
    // };
  }, [storeId]);

  return { inventory, loading, error };
}
