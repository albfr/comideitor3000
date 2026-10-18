import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, sesionValida } from "@/servidor/sesion";

export function proxy(request: NextRequest) {
  if (sesionValida(request.cookies.get(COOKIE_SESION)?.value)) return NextResponse.next();
  const login = new URL("/login", request.url);
  return NextResponse.redirect(login);
}

export const config = {
  // Todo excepto la página de login y los archivos estáticos.
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|plato-generico.svg).*)"],
};
