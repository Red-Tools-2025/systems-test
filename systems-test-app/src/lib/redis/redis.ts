import { Redis } from "ioredis";

// ENV Check + Fetch
const getRedisURL = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error("REDIS_URL env is not defined");
};

// Initializing redis instance
export const redis = new Redis({
  host: "localhost",
  port: 6379,
});
