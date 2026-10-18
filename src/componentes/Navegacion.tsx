"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/", texto: "Hoy" },
  { href: "/semana", texto: "Semana" },
  { href: "/ingredientes", texto: "Ingredientes" },
  { href: "/catalogo", texto: "Catálogo" },
];

export function Navegacion() {
  const ruta = usePathname();
  if (ruta === "/login") return null;
  return <BarraNavegacion ruta={ruta} />;
}

/** Sin `ruta` (mientras se resuelve la URL) no marca ningún enlace como activo. */
export function BarraNavegacion({ ruta }: { ruta: string | null }) {
  const activo = (href: string) =>
    ruta !== null && (href === "/" ? ruta === "/" || ruta.startsWith("/dia") : ruta.startsWith(href));

  return (
    <header className="sticky top-0 z-20 border-b border-borde bg-fondo/95 backdrop-blur">
      <nav className="mx-auto flex max-w-2xl items-center justify-between gap-1 px-4 py-2 sm:justify-start">
        <Link href="/" className="mr-auto hidden text-base font-bold tracking-tight text-acento sm:inline">
          Comideitor3000
        </Link>
        {ENLACES.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            aria-current={activo(e.href) ? "page" : undefined}
            className={`rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors ${
              activo(e.href) ? "bg-acento-suave text-acento" : "text-suave hover:text-texto"
            }`}
          >
            {e.texto}
          </Link>
        ))}
      </nav>
    </header>
  );
}
