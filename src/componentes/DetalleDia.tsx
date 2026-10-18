import Image from "next/image";
import { textoLinea } from "@/dominio/cantidades";
import type { Almuerzo, CatalogoIndexado, Ensalada, LineaIngrediente } from "@/dominio/tipos";
import { ETIQUETA_DIFICULTAD, textoMinutos } from "./formato";

export const IMAGEN_GENERICA = "/plato-generico.svg";

export function ImagenPlato({ almuerzo, prioridad = false }: { almuerzo: Almuerzo; prioridad?: boolean }) {
  const src = almuerzo.imagen ?? IMAGEN_GENERICA;
  return (
    <Image
      src={src}
      alt={almuerzo.imagen ? almuerzo.nombre : "Plato sin imagen"}
      width={800}
      height={450}
      priority={prioridad}
      unoptimized={src.endsWith(".svg")}
      className="aspect-video w-full rounded-xl border border-borde object-cover"
    />
  );
}

export function Etiqueta({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-acento-suave px-2.5 py-1 text-xs font-medium text-acento">{children}</span>;
}

export function ListaIngredientes({
  lineas,
  catalogo,
  porciones,
}: {
  lineas: LineaIngrediente[];
  catalogo: CatalogoIndexado;
  porciones: number;
}) {
  return (
    <ul className="space-y-1.5">
      {lineas.map((l) => {
        const ingrediente = catalogo.ingredientes.get(l.ingrediente);
        if (!ingrediente) return null;
        return (
          <li key={l.ingrediente} className="flex gap-2 text-[15px]">
            <span aria-hidden className="text-acento">•</span>
            <span className={l.opcional ? "text-suave" : undefined}>{textoLinea(l, ingrediente, porciones)}</span>
          </li>
        );
      })}
    </ul>
  );
}

interface PropsDetalle {
  almuerzo: Almuerzo;
  ensalada: Ensalada;
  sustitutoId: string | null;
  comensales: number;
  catalogo: CatalogoIndexado;
  prioridadImagen?: boolean;
}

/** Almuerzo y ensalada de un día con las cantidades para sus comensales (RF-18, RF-19). */
export function DetalleDia({ almuerzo, ensalada, sustitutoId, comensales, catalogo, prioridadImagen }: PropsDetalle) {
  const categoria = catalogo.categorias.get(almuerzo.categoria)?.nombre ?? almuerzo.categoria;
  const sustituto = sustitutoId ? catalogo.sustitutos.get(sustitutoId) : undefined;
  const ingredienteSustituto = sustituto ? catalogo.ingredientes.get(sustituto.ingrediente) : undefined;

  return (
    <article className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold leading-tight">{almuerzo.nombre}</h1>
        <div className="flex flex-wrap gap-2">
          <Etiqueta>Dificultad {ETIQUETA_DIFICULTAD[almuerzo.dificultad].toLowerCase()}</Etiqueta>
          <Etiqueta>{textoMinutos(almuerzo.tiempo_minutos)}</Etiqueta>
          <Etiqueta>{categoria}</Etiqueta>
        </div>
      </header>

      <ImagenPlato almuerzo={almuerzo} prioridad={prioridadImagen} />

      <section className="rounded-xl border border-borde bg-tarjeta p-4">
        <h2 className="mb-2 font-semibold">
          Ingredientes para {comensales} {comensales === 1 ? "persona" : "personas"}
        </h2>
        <ListaIngredientes lineas={almuerzo.ingredientes} catalogo={catalogo} porciones={comensales} />
        {sustituto && ingredienteSustituto && (
          <p className="mt-3 border-t border-borde pt-3 text-[15px]">
            <span className="font-medium">Sustituto de carne:</span>{" "}
            {textoLinea({ ingrediente: sustituto.ingrediente, cantidad: sustituto.gramos_por_porcion, unidad: "g" }, ingredienteSustituto, 1)}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-borde bg-tarjeta p-4">
        <h2 className="mb-2 font-semibold">
          Ensalada: {ensalada.nombre}{" "}
          <span className="text-sm font-normal text-suave">· dificultad {ETIQUETA_DIFICULTAD[ensalada.dificultad].toLowerCase()}</span>
        </h2>
        <ListaIngredientes lineas={ensalada.ingredientes} catalogo={catalogo} porciones={comensales} />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Preparación</h2>
        <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed marker:text-suave">
          {almuerzo.preparacion.map((paso, i) => (
            <li key={i}>{paso}</li>
          ))}
        </ol>
      </section>
    </article>
  );
}
