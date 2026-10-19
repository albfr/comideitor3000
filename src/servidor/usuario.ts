import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, emailPermitido } from "./auth";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  imagen: string | null;
}

/** Usuario de la sesión actual, o null si no hay sesión o su email ya no está autorizado. */
export async function usuarioActual(): Promise<Usuario | null> {
  const sesion = await auth.api.getSession({ headers: await headers() });
  if (!sesion || !emailPermitido(sesion.user.email)) return null;
  const { id, name, email, image } = sesion.user;
  return { id, nombre: name, email, imagen: image ?? null };
}

/**
 * Capa de acceso a datos: toda página y acción de servidor obtiene al usuario desde aquí.
 * Sin sesión válida redirige a /login (las acciones son alcanzables por POST aunque el proxy las cubra).
 */
export async function exigirUsuario(): Promise<Usuario> {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  return usuario;
}
