// src/hooks/useInventory.ts
import { useEffect, useState } from "react";
import type { Inventory } from "@/types/db";
import { employeeAtom } from "@/atoms/auth";
import { useAtom } from "jotai";
import useTypeGaurds from "./useTypeGaurds";

export function useInventory(storeId?: number) {
  const { isValidSaleEvent } = useTypeGaurds();
  const [employee] = useAtom(employeeAtom);
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

  // For managing updates to current product
  useEffect(() => {
    if (!employee?.store_id) return;

    const source = new EventSource(
      `/api/event-source/pos?storeId=${employee.store_id}`
    );

    source.addEventListener("message", (event) => {
      const sales_event = JSON.parse(event.data);
      // Validate incomming type to sales event type
      if (isValidSaleEvent(sales_event) && sales_event) {
        // apply updates on the current inventory
        setInventory((prev) =>
          prev.map((item) =>
            item.id === sales_event.p_id
              ? { ...item, quantity: item.quantity + sales_event.delta }
              : item
          )
        );
      }
    });
    return () => {
      source.close();
    };
  }, [employee?.store_id]);

  return { inventory, loading, error };
}
