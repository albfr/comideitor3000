import Link from "next/link";
import { connection } from "next/server";
import { cerrarSesion } from "@/app/acciones";
import { ETIQUETA_DIFICULTAD, textoMinutos } from "@/componentes/formato";
import { cargarCatalogo } from "@/servidor/catalogo";
import { Suspense } from "react";
import Cargando from "@/app/loading";
import { exigirUsuario } from "@/servidor/usuario";

const botonSecundario = "rounded-lg border border-borde bg-tarjeta px-3 py-2 text-sm font-semibold hover:border-acento";

async function ContenidoVistaCatalogo() {
  await connection();
  const usuario = await exigirUsuario();
  const catalogo = await cargarCatalogo();
  const { almuerzos, ensaladas, categorias_almuerzo } = catalogo.catalogo;

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/catalogo/nuevo?tipo=almuerzo" className="rounded-lg bg-acento px-3 py-2 text-sm font-semibold text-acento-texto">
            + Almuerzo
          </Link>
          <Link href="/catalogo/nuevo?tipo=ensalada" className={botonSecundario}>
            + Ensalada
          </Link>
          <Link href="/catalogo/ingredientes/nuevo" className={botonSecundario}>
            + Ingrediente
          </Link>
        </div>
      </header>

      <div className="space-y-6 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-8 lg:space-y-0">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Almuerzos ({almuerzos.length})</h2>
        <div className="space-y-4 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
        {categorias_almuerzo.map((categoria) => {
          const lista = almuerzos.filter((a) => a.categoria === categoria.id);
          if (lista.length === 0) return null;
          return (
            <div key={categoria.id} className="space-y-1.5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-suave">{categoria.nombre}</h3>
              <ul className="divide-y divide-borde overflow-hidden rounded-xl border border-borde bg-tarjeta">
                {lista.map((a) => (
                  <li key={a.id}>
                    <Link href={`/catalogo/${a.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-acento-suave">
                      <span className="font-medium">{a.nombre}</span>
                      <span className="shrink-0 text-xs text-suave">
                        {ETIQUETA_DIFICULTAD[a.dificultad]} · {textoMinutos(a.tiempo_minutos)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Ensaladas ({ensaladas.length})</h2>
        <ul className="divide-y divide-borde overflow-hidden rounded-xl border border-borde bg-tarjeta">
          {ensaladas.map((e) => (
            <li key={e.id}>
              <Link href={`/catalogo/${e.id}`} className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-acento-suave">
                <span className="font-medium">{e.nombre}</span>
                <span className="shrink-0 text-xs text-suave">{ETIQUETA_DIFICULTAD[e.dificultad]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      </div>

      <form action={cerrarSesion} className="flex flex-wrap items-center gap-2 border-t border-borde pt-4 text-sm text-suave">
        <span>
          Sesión iniciada como <span className="font-medium text-texto">{usuario.nombre}</span> ({usuario.email}).
        </span>
        <button className="underline hover:text-texto">Cerrar sesión</button>
      </form>
    </div>
  );
}

export default function VistaCatalogo() {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoVistaCatalogo />
    </Suspense>
  );
}
