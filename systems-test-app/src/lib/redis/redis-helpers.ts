import { pool } from "../neon";
import { redis } from "./redis";

// Implements cache miss protocal, syncing and keeping cache active with database
const cacheMissProtocall = async (store_id: number, cache_key: string) => {
  const cached = await redis.get(cache_key);
  // if cached_key is populated retrieve KV data and parse
  if (cached) {
    console.log("Data from cache was retrieved");
    return JSON.parse(cached);
  }

  // if cached: missed retrieve from database, and store to cache
  const db_response = await pool.query(
    "SELECT id, product_name, quantity, price FROM inventory WHERE store_id = $1",
    [store_id]
  );

  // Parse store to cache, for future use
  const store_inv_data = db_response.rows;
  await redis.set(cache_key, JSON.stringify(store_inv_data));

  console.log("Data from database was retrieved");
  return store_inv_data;
};

const cacheMissProtocallV2 = async (store_id: number, cache_key: string) => {
  // We get all sub set members of cache keys by product id
  const cached_product_ids = await redis.smembers(cache_key);

  // if there are chached_ids then fetch from cache
  if (cached_product_ids.length > 0) {
    // Cache:hit fetch JSON data of each product (via Pipeline)
    const pipeline = redis.pipeline();
    // Transaction method equivalent to *--- Promise.all(redis.hset) ---*
    cached_product_ids.forEach((p_id) => {
      pipeline.get(`${cache_key}:${p_id}`);
    });

    // Execute pipeline on finishing accumilation
    const results = await pipeline.exec();
    if (results) {
      const products = results
        .map(([err, res]) => (typeof res === "string" ? JSON.parse(res) : null))
        .filter(Boolean);
      console.log("Data from cache was retrieved");
      return products;
    }
  }

  // Cache:miss, fetch from db
  const db_response = await pool.query(
    "SELECT id, product_name, quantity, price FROM inventory WHERE store_id = $1",
    [store_id]
  );
  const store_inv_data = db_response.rows;

  // Add individual products to cache
  if (store_inv_data.length > 0) {
    // Initiate pipeline for uploading
    const pipeline = redis.pipeline();
    store_inv_data.map((p) => {
      pipeline.set(`${cache_key}:${p.id}`, JSON.stringify(p));
      // Create a product id set for future access
      pipeline.sadd(`inv_products:${store_id}`, p.id);
    });

    // On transaction accumalation execute pipeline
    await pipeline.exec();
  }
  console.log("Data from database was retrieved");
  return store_inv_data;
};

export { cacheMissProtocall };
