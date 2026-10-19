import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Comprobación rápida: sin cookie de sesión se va a /login. La validación real de la sesión
// (y de que el email esté autorizado) ocurre en exigirUsuario(), en cada página y acción.
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico|plato-generico.svg).*)"],
};
