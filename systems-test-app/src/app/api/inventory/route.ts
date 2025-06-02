// app/api/inventory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cacheMissProtocall } from "@/lib/redis/redis-helpers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("store_id");

    // Define store cache-key, Later retrieve from database
    const cache_key = `inv_products:${storeId}`;

    if (!storeId) {
      return NextResponse.json(
        { error: "store_id is required" },
        { status: 400 }
      );
    }

    // Cache OR PG retrieval
    const result = await cacheMissProtocall(Number(storeId), cache_key);

    return NextResponse.json({ inventory: result });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
