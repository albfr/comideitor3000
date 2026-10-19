import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioReceta, type FilaFormulario } from "@/componentes/FormularioReceta";
import { formatearNumero } from "@/dominio/cantidades";
import type { LineaIngrediente } from "@/dominio/tipos";
import { cargarCatalogo } from "@/servidor/catalogo";
import { Suspense } from "react";
import Cargando from "@/app/loading";

function aFila(linea: LineaIngrediente): FilaFormulario {
  return linea.opcional
    ? { ingrediente: linea.ingrediente, modo: "al_gusto", cantidad: "" }
    : { ingrediente: linea.ingrediente, modo: linea.unidad, cantidad: formatearNumero(linea.cantidad) };
}

async function ContenidoEditarReceta({ params }: PageProps<"/catalogo/[id]/editar">) {
  const { id } = await params;
  const catalogo = await cargarCatalogo();
  const almuerzo = catalogo.almuerzos.get(id);
  const ensalada = catalogo.ensaladas.get(id);
  const receta = almuerzo ?? ensalada;
  if (!receta) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href={`/catalogo/${id}`} className="text-sm font-medium text-acento">
        ← {receta.nombre}
      </Link>
      <h1 className="text-2xl font-bold">Editar {almuerzo ? "almuerzo" : "ensalada"}</h1>
      <FormularioReceta
        tipo={almuerzo ? "almuerzo" : "ensalada"}
        categorias={catalogo.catalogo.categorias_almuerzo}
        ingredientes={catalogo.catalogo.ingredientes.map((i) => ({ id: i.id, nombre: i.nombre, cucharada: !!i.gramos_por_cucharada }))}
        inicial={{
          id,
          nombre: receta.nombre,
          dificultad: receta.dificultad,
          categoria: almuerzo?.categoria,
          tiempo: almuerzo ? String(almuerzo.tiempo_minutos) : undefined,
          preparacion: almuerzo?.preparacion.join("\n"),
          filas: receta.ingredientes.map(aFila),
        }}
        volver={`/catalogo/${id}/editar`}
      />
    </div>
  );
}

export default function EditarReceta(props: PageProps<"/catalogo/[id]/editar">) {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoEditarReceta {...props} />
    </Suspense>
  );
}
