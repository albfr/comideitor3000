import Link from "next/link";
import { notFound } from "next/navigation";
import { eliminarRecetaDesdeFormulario } from "@/app/acciones";
import { BotonEliminar } from "@/componentes/BotonEliminar";
import { DisposicionReceta, Etiqueta, ImagenPlato, ListaIngredientes, Preparacion } from "@/componentes/DetalleDia";
import { ETIQUETA_DIFICULTAD, textoMinutos } from "@/componentes/formato";
import { cargarCatalogo } from "@/servidor/catalogo";
import { Suspense } from "react";
import Cargando from "@/app/loading";

async function ContenidoVistaReceta({ params }: PageProps<"/catalogo/[id]">) {
  const { id } = await params;
  const catalogo = await cargarCatalogo();
  const almuerzo = catalogo.almuerzos.get(id);
  const ensalada = catalogo.ensaladas.get(id);
  const receta = almuerzo ?? ensalada;
  if (!receta) notFound();

  return (
    <div className="space-y-5">
      <Link href="/catalogo" className="text-sm font-medium text-acento">
        ← Catálogo
      </Link>
      <DisposicionReceta
        encabezado={
          <header className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-suave">{almuerzo ? "Almuerzo" : "Ensalada"}</p>
            <h1 className="text-2xl font-bold leading-tight">{receta.nombre}</h1>
            <div className="flex flex-wrap gap-2">
              <Etiqueta>Dificultad {ETIQUETA_DIFICULTAD[receta.dificultad].toLowerCase()}</Etiqueta>
              {almuerzo && <Etiqueta>{textoMinutos(almuerzo.tiempo_minutos)}</Etiqueta>}
              {almuerzo && <Etiqueta>{catalogo.categorias.get(almuerzo.categoria)?.nombre}</Etiqueta>}
            </div>
          </header>
        }
        imagen={almuerzo && <ImagenPlato almuerzo={almuerzo} />}
        lateral={
          <>
            <section className="rounded-xl border border-borde bg-tarjeta p-4">
              <h2 className="mb-2 font-semibold">Ingredientes por porción</h2>
              <ListaIngredientes lineas={receta.ingredientes} catalogo={catalogo} comensales={1} />
            </section>
            <div className="flex gap-2">
              <Link href={`/catalogo/${id}/editar`} className="rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-acento-texto">
                Editar
              </Link>
              <BotonEliminar id={id} nombre={receta.nombre} accion={eliminarRecetaDesdeFormulario} />
            </div>
          </>
        }
        preparacion={almuerzo && <Preparacion pasos={almuerzo.preparacion} />}
      />
    </div>
  );
}

export default function VistaReceta(props: PageProps<"/catalogo/[id]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoVistaReceta {...props} />
    </Suspense>
  );
}
