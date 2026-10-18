import { createHmac, timingSafeEqual } from "node:crypto";

// Protección con una sola contraseña (RNF-08 y RNF-09): APP_PASSWORD y una cookie de sesión de 30 días.

export const COOKIE_SESION = "comideitor_sesion";
export const DURACION_SESION_SEGUNDOS = 30 * 24 * 60 * 60;

function contrasena(): string | undefined {
  return process.env.APP_PASSWORD || undefined;
}

/** Sin APP_PASSWORD la aplicación queda abierta, pero solo en desarrollo. */
export function proteccionDesactivada(): boolean {
  return !contrasena() && process.env.NODE_ENV !== "production";
}

export function tokenDeSesion(clave: string): string {
  return createHmac("sha256", clave).update("comideitor3000-sesion").digest("hex");
}

function iguales(a: string, b: string): boolean {
  const [x, y] = [Buffer.from(a), Buffer.from(b)];
  return x.length === y.length && timingSafeEqual(x, y);
}

export function contrasenaCorrecta(intento: string): boolean {
  const clave = contrasena();
  return !!clave && iguales(intento, clave);
}

export function sesionValida(token: string | undefined): boolean {
  if (proteccionDesactivada()) return true;
  const clave = contrasena();
  return !!clave && !!token && iguales(token, tokenDeSesion(clave));
}
