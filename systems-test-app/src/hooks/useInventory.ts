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
  }, [storeId]);

  return { inventory, loading, error };
}
