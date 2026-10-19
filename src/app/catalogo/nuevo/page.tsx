import Link from "next/link";
import { FormularioReceta } from "@/componentes/FormularioReceta";
import { cargarCatalogo } from "@/servidor/catalogo";
import { Suspense } from "react";
import Cargando from "@/app/loading";

async function ContenidoNuevaReceta({ searchParams }: PageProps<"/catalogo/nuevo">) {
  const { tipo: pedido } = await searchParams;
  const tipo = pedido === "ensalada" ? "ensalada" : "almuerzo";
  const catalogo = await cargarCatalogo();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/catalogo" className="text-sm font-medium text-acento">
        ← Catálogo
      </Link>
      <h1 className="text-2xl font-bold">{tipo === "almuerzo" ? "Nuevo almuerzo" : "Nueva ensalada"}</h1>
      <FormularioReceta
        tipo={tipo}
        categorias={catalogo.catalogo.categorias_almuerzo}
        ingredientes={catalogo.catalogo.ingredientes.map((i) => ({ id: i.id, nombre: i.nombre, cucharada: !!i.gramos_por_cucharada }))}
        inicial={{ nombre: "", dificultad: "baja", filas: [] }}
        volver={`/catalogo/nuevo?tipo=${tipo}`}
      />
      {tipo === "almuerzo" && (
        <p className="text-sm text-suave">La imagen del almuerzo se carga por script (ver README); mientras tanto se muestra una imagen genérica.</p>
      )}
    </div>
  );
}

export default function NuevaReceta(props: PageProps<"/catalogo/nuevo">) {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoNuevaReceta {...props} />
    </Suspense>
  );
}
