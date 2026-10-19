// Solo para desarrollo: crea (si no existe) un usuario de prueba y una sesión, sin pasar por Google,
// e imprime la cookie para pegarla en el navegador. Se niega a correr contra una base remota.
// Uso: npm run auth:sesion-prueba -- prueba@ejemplo.test
import { betterAuth } from "better-auth";
import { testUtils } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { opcionesAuth } from "../src/servidor/auth";
import { db } from "../src/servidor/db";
import { user } from "../src/servidor/esquema";

async function main() {
  const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
  if (process.env.NODE_ENV === "production" || !url.startsWith("file:"))
    throw new Error("Este script solo funciona con una base de datos local (file:).");
  const email = process.argv[2]?.trim().toLowerCase() ?? "prueba@ejemplo.test";

  // Instancia aparte, con el mismo secreto, solo para pruebas (como recomienda Better Auth).
  const authPrueba = betterAuth({ ...opcionesAuth, plugins: [testUtils()] });
  const { test } = await authPrueba.$context;

  const [existente] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  const userId =
    existente?.id ?? (await test.saveUser(test.createUser({ email, name: "Usuario de prueba", emailVerified: true }))).id;
  const cookies = await test.getCookies({ userId, domain: "localhost" });
  console.log(JSON.stringify(cookies.map(({ name, value }) => ({ name, value }))));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
