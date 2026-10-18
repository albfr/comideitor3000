import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as esquema from "./esquema";

// En desarrollo, sin TURSO_DATABASE_URL, se usa un archivo SQLite local.
const cliente = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(cliente, { schema: esquema });
export type BaseDeDatos = typeof db;
