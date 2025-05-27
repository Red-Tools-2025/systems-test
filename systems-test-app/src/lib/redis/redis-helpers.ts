import { pool } from "../neon";
import { redis } from "./redis";

const CACHE_TTL_SECONDS = 300;

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
  await redis.set(
    cache_key,
    JSON.stringify(store_inv_data),
    "EX",
    CACHE_TTL_SECONDS
  );

  console.log("Data from database was retrieved");
  return store_inv_data;
};
