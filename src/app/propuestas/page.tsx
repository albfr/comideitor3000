import Link from "next/link";
import { connection } from "next/server";
import { elegirMinuta } from "@/app/acciones";
import { DetalleDia } from "@/componentes/DetalleDia";
import { textoFecha } from "@/componentes/formato";
import { PestanasAlternativas } from "@/componentes/PestanasAlternativas";
import { VentanaFlotante } from "@/componentes/VentanaFlotante";
import { diasDeSemana, diasRestantes, esFinDeSemana, hoy, inicioSemana, sumarDias } from "@/dominio/fechas";
import { cargarCatalogo } from "@/servidor/catalogo";
import { COMENSALES_POR_DEFECTO, obtenerPropuestas, obtenerSemana, tieneMinuta, VEGETARIANOS_POR_DEFECTO } from "@/servidor/minutas";
import { Suspense } from "react";
import Cargando from "@/app/loading";

/**
 * Propuestas de minuta. Accesible sábado y domingo para la semana siguiente, o cualquier día
 * si la semana actual no tiene minuta (en ese caso cubre los días restantes, incluyendo hoy).
 */
async function ContenidoVistaPropuestas({ searchParams }: PageProps<"/propuestas">) {
  await connection();
  const { semana: pedida } = await searchParams;
  const fecha = hoy();
  const inicioActual = inicioSemana(fecha);
  const actualSinMinuta = !tieneMinuta(await obtenerSemana(inicioActual));

  let objetivo: "actual" | "siguiente" | null = null;
  if (pedida === "actual" && actualSinMinuta) objetivo = "actual";
  else if (esFinDeSemana(fecha)) objetivo = "siguiente";
  else if (actualSinMinuta) objetivo = "actual";

  if (!objetivo)
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Propuestas de minuta</h1>
        <p className="text-suave">Las propuestas para la próxima semana están disponibles el sábado y el domingo.</p>
        <Link href="/semana" className="font-medium text-acento">
          Ver la minuta de esta semana →
        </Link>
      </div>
    );

  const inicio = objetivo === "actual" ? inicioActual : sumarDias(inicioActual, 7);
  const fechas = objetivo === "actual" ? diasRestantes(fecha) : diasDeSemana(inicio);
  const catalogoGeneracion = await cargarCatalogo();
  const [resultado, catalogo] = await Promise.all([
    obtenerPropuestas(inicio, fechas, catalogoGeneracion),
    cargarCatalogo({ incluirEliminadas: true }),
  ]);
  const titulo = objetivo === "actual" ? "Minuta para lo que queda de la semana" : "Minuta de la próxima semana";

  if (resultado.estado === "elegida")
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <p>Ya elegiste la alternativa {resultado.seleccionada + 1}. La elección no se puede cambiar.</p>
        <Link href="/semana" className="font-medium text-acento">
          Ver la vista bisemanal →
        </Link>
      </div>
    );

  if (resultado.estado === "error")
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <div role="alert" className="rounded-xl border border-peligro/40 bg-peligro-suave p-4 text-peligro">
          {resultado.motivo}
        </div>
      </div>
    );

  const paneles = resultado.propuestas.map((alternativa, indice) => (
    <div key={indice} className="space-y-3">
      <ul className="space-y-2">
        {alternativa.map((dia) => {
          const almuerzo = catalogo.almuerzos.get(dia.almuerzoId);
          const ensalada = catalogo.ensaladas.get(dia.ensaladaId);
          if (!almuerzo || !ensalada) return null;
          return (
            <li key={dia.fecha}>
              <VentanaFlotante
                titulo={`${textoFecha(dia.fecha)}: ${almuerzo.nombre}`}
                className="flex w-full items-center gap-3 rounded-xl border border-borde bg-tarjeta p-3 text-left transition-colors hover:border-acento"
                disparador={
                  <>
                    <span className="w-24 shrink-0 text-sm font-semibold text-suave">{textoFecha(dia.fecha)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 block font-medium leading-snug">{almuerzo.nombre}</span>
                      <span className="block truncate text-sm text-suave">{ensalada.nombre}</span>
                    </span>
                    <span aria-hidden className="text-suave">›</span>
                  </>
                }
              >
                <p className="mb-3 text-sm font-medium uppercase tracking-wide text-suave">
                  {textoFecha(dia.fecha)} · Alternativa {indice + 1}
                </p>
                <DetalleDia
                  almuerzo={almuerzo}
                  ensalada={ensalada}
                  sustitutoId={dia.sustitutoId}
                  comensales={COMENSALES_POR_DEFECTO}
                  vegetarianos={VEGETARIANOS_POR_DEFECTO}
                  catalogo={catalogo}
                />
              </VentanaFlotante>
            </li>
          );
        })}
      </ul>
      <form action={elegirMinuta}>
        <input type="hidden" name="inicio" value={inicio} />
        <input type="hidden" name="indice" value={indice} />
        <button className="w-full rounded-xl bg-acento px-4 py-3 font-semibold text-acento-texto">
          Elegir la alternativa {indice + 1}
        </button>
      </form>
    </div>
  ));

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <p className="text-sm text-suave">
          {fechas.length === 1
            ? `Solo el ${textoFecha(fechas[0]).toLowerCase()}.`
            : `Del ${textoFecha(fechas[0]).toLowerCase()} al ${textoFecha(fechas.at(-1)!).toLowerCase()}.`}{" "}
          Toca un día para ver su almuerzo. Una vez elegida, la minuta no se puede cambiar.
        </p>
      </header>
      <PestanasAlternativas paneles={paneles} />
    </div>
  );
}

export default function VistaPropuestas(props: PageProps<"/propuestas">) {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoVistaPropuestas {...props} />
    </Suspense>
  );
}
