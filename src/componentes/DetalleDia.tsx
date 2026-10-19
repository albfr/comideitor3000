import Image from "next/image";
import { porcionesDeLinea, textoLinea } from "@/dominio/cantidades";
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

export function Preparacion({ pasos }: { pasos: string[] }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">Preparación</h2>
      <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-relaxed marker:text-suave">
        {pasos.map((paso, i) => (
          <li key={i}>{paso}</li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Disposición de una receta. En espacios angostos (celular, columnas de propuestas) va todo apilado,
 * con la preparación al final. Cuando el contenedor mide al menos 48rem, los ingredientes pasan a
 * una columna derecha fija y el resto queda a la izquierda.
 */
export function DisposicionReceta({
  encabezado,
  imagen,
  lateral,
  preparacion,
}: {
  encabezado: React.ReactNode;
  imagen?: React.ReactNode;
  lateral: React.ReactNode;
  preparacion?: React.ReactNode;
}) {
  return (
    <div className="@container">
      <article className="space-y-5 @3xl:grid @3xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] @3xl:grid-rows-[auto_auto_1fr] @3xl:gap-x-8 @3xl:gap-y-5 @3xl:space-y-0">
        <div className="@3xl:col-start-1">{encabezado}</div>
        {imagen && <div className="@3xl:col-start-1">{imagen}</div>}
        <div className="space-y-5 @3xl:sticky @3xl:top-20 @3xl:col-start-2 @3xl:row-span-3 @3xl:row-start-1 @3xl:self-start">
          {lateral}
        </div>
        {preparacion && <div className="@3xl:col-start-1">{preparacion}</div>}
      </article>
    </div>
  );
}

export function Etiqueta({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-acento-suave px-2.5 py-1 text-xs font-medium text-acento">{children}</span>;
}

/** Ingredientes escalados: la carne para los no vegetarianos y el resto para todos. */
export function ListaIngredientes({
  lineas,
  catalogo,
  comensales,
  vegetarianos = 0,
}: {
  lineas: LineaIngrediente[];
  catalogo: CatalogoIndexado;
  comensales: number;
  vegetarianos?: number;
}) {
  return (
    <ul className="space-y-1.5">
      {lineas.map((l) => {
        const ingrediente = catalogo.ingredientes.get(l.ingrediente);
        if (!ingrediente) return null;
        const porciones = porcionesDeLinea(ingrediente, comensales, vegetarianos);
        if (porciones === 0 && !l.opcional) return null;
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
  vegetarianos: number;
  catalogo: CatalogoIndexado;
  prioridadImagen?: boolean;
}

/** Almuerzo y ensalada de un día con las cantidades para sus comensales (RF-18, RF-19). */
export function DetalleDia({ almuerzo, ensalada, sustitutoId, comensales, vegetarianos, catalogo, prioridadImagen }: PropsDetalle) {
  const categoria = catalogo.categorias.get(almuerzo.categoria)?.nombre ?? almuerzo.categoria;
  const sustituto = sustitutoId ? catalogo.sustitutos.get(sustitutoId) : undefined;
  const ingredienteSustituto = sustituto ? catalogo.ingredientes.get(sustituto.ingrediente) : undefined;

  const encabezado = (
    <header className="space-y-2">
      <h1 className="text-2xl font-bold leading-tight">{almuerzo.nombre}</h1>
      <div className="flex flex-wrap gap-2">
        <Etiqueta>Dificultad {ETIQUETA_DIFICULTAD[almuerzo.dificultad].toLowerCase()}</Etiqueta>
        <Etiqueta>{textoMinutos(almuerzo.tiempo_minutos)}</Etiqueta>
        <Etiqueta>{categoria}</Etiqueta>
      </div>
    </header>
  );

  const ingredientes = (
    <>
      <section className="rounded-xl border border-borde bg-tarjeta p-4">
        <h2 className="mb-2 font-semibold">
          Ingredientes para {comensales} {comensales === 1 ? "persona" : "personas"}
          {vegetarianos > 0 && (
            <span className="font-normal text-suave">
              {" "}
              ({vegetarianos} {vegetarianos === 1 ? "vegetariana" : "vegetarianas"})
            </span>
          )}
        </h2>
        <ListaIngredientes lineas={almuerzo.ingredientes} catalogo={catalogo} comensales={comensales} vegetarianos={vegetarianos} />
        {sustituto && ingredienteSustituto && vegetarianos > 0 && (
          <p className="mt-3 border-t border-borde pt-3 text-[15px]">
            <span className="font-medium">
              Sustituto de carne ({vegetarianos} {vegetarianos === 1 ? "porción" : "porciones"}):
            </span>{" "}
            {textoLinea(
              { ingrediente: sustituto.ingrediente, cantidad: sustituto.gramos_por_porcion, unidad: "g" },
              ingredienteSustituto,
              vegetarianos,
            )}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-borde bg-tarjeta p-4">
        <h2 className="mb-2 font-semibold">
          Ensalada: {ensalada.nombre}{" "}
          <span className="text-sm font-normal text-suave">· dificultad {ETIQUETA_DIFICULTAD[ensalada.dificultad].toLowerCase()}</span>
        </h2>
        <ListaIngredientes lineas={ensalada.ingredientes} catalogo={catalogo} comensales={comensales} vegetarianos={vegetarianos} />
      </section>
    </>
  );

  return (
    <DisposicionReceta
      encabezado={encabezado}
      imagen={<ImagenPlato almuerzo={almuerzo} prioridad={prioridadImagen} />}
      lateral={ingredientes}
      preparacion={<Preparacion pasos={almuerzo.preparacion} />}
    />
  );
}
