import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import { account, session, user, verification } from "./esquema";

/**
 * Emails autorizados (EMAILS_PERMITIDOS, separados por comas). Sin la variable, en desarrollo
 * entra cualquier cuenta y en producción ninguna.
 */
export function emailPermitido(email: string): boolean {
  const lista = (process.env.EMAILS_PERMITIDOS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (lista.length === 0) return process.env.NODE_ENV !== "production";
  return lista.includes(email.trim().toLowerCase());
}

const google =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } }
    : {};

export const opcionesAuth = {
  database: drizzleAdapter(db, { provider: "sqlite", schema: { user, session, account, verification } }),
  socialProviders: google,
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    // Evita una consulta a la base de datos en cada página: la sesión se valida desde la cookie por 5 minutos.
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  databaseHooks: {
    user: {
      create: {
        // Solo se crean cuentas para emails autorizados.
        before: async (nuevo: { email: string }) => (emailPermitido(nuevo.email) ? undefined : false),
      },
    },
  },
} as const;

export const auth = betterAuth({ ...opcionesAuth, plugins: [nextCookies()] });
