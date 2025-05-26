import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_UI2ASRQeO3aK@ep-billowing-sunset-a8jhvizk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require",
});

export { pool };
