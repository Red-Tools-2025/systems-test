import { redis } from "@/lib/redis/redis";
import { NextRequest, NextResponse } from "next/server";

interface Sale {
  p_id: number;
  quantity: number;
}

interface PosSalesRequestBody {
  sales: Sale[];
  storeId: number;
}

export async function POST(req: NextRequest) {
  try {
    const { sales, storeId }: PosSalesRequestBody = await req.json();
    console.log(sales);

    // Define cache key & fetch all cached product ids
    const cache_key = `inv_products:${storeId}`;
    const cached_product_ids = await redis.smembers(cache_key);

    // If there are cache keys render em out
    if (!cached_product_ids || cached_product_ids.length === 0) {
      return NextResponse.json(
        { error: "Cache not populated or found" },
        { status: 404 }
      );
    }
    // validate and filter out the incoming p_ids from sales
    const ps_to_get = cached_product_ids.filter((pid) =>
      sales.some((sale) => sale.p_id === Number(pid))
    );

    // Attain retriever pipeline
    const retrieverPipeline = redis.pipeline();
    ps_to_get.forEach((pid) => {
      // Gets each product details from cached via id
      retrieverPipeline.get(`${cache_key}:${pid}`);
    });

    // On Accumalation perform execution
    const cached_products = await retrieverPipeline.exec();

    // Once we get that we then allow for updating by updating these chached products
    if (!cached_products)
      return NextResponse.json(
        { error: "Product Cache not populated or found" },
        { status: 404 }
      );

    // Prepare Update pipeline
    const updatePipeline = redis.pipeline();

    // Perform Product quantity updates
    cached_products.forEach(([err, res], index) => {
      // Ignore empty or missing caches
      if (err || !res) return;
      // Pipelines are atomic in nature & preserve order
      const pid = ps_to_get[index]; // Safe to use index, because order is preserved
      const product = typeof res === "string" ? JSON.parse(res) : null;

      // Find matching sale
      const sale = sales.find((p) => p.p_id === Number(pid));
      if (!sale) return;

      // Update quantity
      product.quantity = Math.max(0, product.quantity - sale.quantity);

      // Push Updates to update pipeline
      updatePipeline.set(`${cache_key}:${pid}`, JSON.stringify(product));

      // Log sale update to Redis update queue
      updatePipeline.rpush(
        `update_queue:${storeId}`,
        JSON.stringify({
          p_id: Number(pid),
          delta: -sale.quantity,
          timestamp: Date.now(),
          store_id: storeId,
        })
      );
    });

    // Notify for sales to all subscribers to channel
    sales.forEach((sale) => {
      console.log(`published update for: ${sale.p_id}`);
      redis.publish(
        `pos:updates:${storeId}`,
        JSON.stringify({
          p_id: sale.p_id,
          delta: -sale.quantity,
          timestamp: Date.now(),
          storeId: storeId,
        })
      );
    });

    await updatePipeline.exec();
    return NextResponse.json({
      success: true,
      message: "Cache updated for sales",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
