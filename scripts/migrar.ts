// Aplica las migraciones de drizzle/ a la base de datos (TURSO_DATABASE_URL o local.db).
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../src/servidor/db";

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migraciones aplicadas.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
