import Link from "next/link";
import { FormularioIngrediente } from "@/componentes/FormularioIngrediente";
import { PASILLOS } from "@/servidor/pasillos";
import { Suspense } from "react";
import Cargando from "@/app/loading";

async function ContenidoNuevoIngrediente({ searchParams }: PageProps<"/catalogo/ingredientes/nuevo">) {
  const { volver: pedido } = await searchParams;
  const volver = typeof pedido === "string" && pedido.startsWith("/catalogo") ? pedido : "/catalogo";
  return (
    <div className="space-y-5">
      <Link href={volver} className="text-sm font-medium text-acento">
        ← Volver
      </Link>
      <h1 className="text-2xl font-bold">Nuevo ingrediente</h1>
      <FormularioIngrediente pasillos={PASILLOS} volver={volver} />
    </div>
  );
}

export default function NuevoIngrediente(props: PageProps<"/catalogo/ingredientes/nuevo">) {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoNuevoIngrediente {...props} />
    </Suspense>
  );
}
