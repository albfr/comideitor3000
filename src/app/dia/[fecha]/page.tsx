import Link from "next/link";
import { notFound } from "next/navigation";
import { DetalleDia } from "@/componentes/DetalleDia";
import { textoFecha } from "@/componentes/formato";
import { cargarCatalogo } from "@/servidor/catalogo";
import { obtenerDia } from "@/servidor/minutas";
import { Suspense } from "react";
import Cargando from "@/app/loading";

/** Detalle del almuerzo y la ensalada de cualquier día planificado (RF-19). */
async function ContenidoVistaDia({ params }: PageProps<"/dia/[fecha]">) {
  const { fecha } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) notFound();
  const [dia, catalogo] = await Promise.all([obtenerDia(fecha), cargarCatalogo({ incluirEliminadas: true })]);
  const almuerzo = dia && catalogo.almuerzos.get(dia.almuerzoId);
  const ensalada = dia && catalogo.ensaladas.get(dia.ensaladaId);

  return (
    <div className="space-y-5">
      <Link href="/semana" className="text-sm font-medium text-acento">
        ← Volver a la semana
      </Link>
      <p className="text-sm font-medium uppercase tracking-wide text-suave">{textoFecha(fecha)}</p>
      {almuerzo && ensalada ? (
        <DetalleDia almuerzo={almuerzo} ensalada={ensalada} sustitutoId={dia.sustitutoId} comensales={dia.comensales} catalogo={catalogo} />
      ) : (
        <p className="text-suave">Este día no tiene minuta.</p>
      )}
    </div>
  );
}

export default function VistaDia(props: PageProps<"/dia/[fecha]">) {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoVistaDia {...props} />
    </Suspense>
  );
}
