import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Set your Neon Postgres connection string in .env
});

export { pool };
