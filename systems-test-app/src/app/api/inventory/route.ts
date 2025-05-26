// app/api/inventory/route.ts
import { pool } from "@/lib/neon";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("store_id");

    if (!storeId) {
      return NextResponse.json(
        { error: "store_id is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT id, product_name, quantity, price FROM inventory WHERE store_id = $1",
      [storeId]
    );

    return NextResponse.json({ inventory: result.rows });
  } catch (error) {
    console.error("Inventory fetch error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
