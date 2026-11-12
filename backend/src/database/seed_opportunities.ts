import { pool } from "../config/database.js";
import { seedOpportunities } from "./opportunities.seed.js";

const client = await pool.connect();
try {
  await client.query("BEGIN");
  const results = await seedOpportunities(client);
  await client.query("COMMIT");
  console.table(results);
} catch (error) {
  await client.query("ROLLBACK");
  console.error(
    "Opportunities seed failed:",
    error instanceof Error ? error.message : "Unknown error",
  );
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
