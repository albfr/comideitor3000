import Link from "next/link";
import { connection } from "next/server";
import { DetalleDia } from "@/componentes/DetalleDia";
import { textoFecha } from "@/componentes/formato";
import { esFinDeSemana, hoy, inicioSemana, sumarDias } from "@/dominio/fechas";
import { cargarCatalogo } from "@/servidor/catalogo";
import { obtenerDia, obtenerSemana, tieneMinuta } from "@/servidor/minutas";
import { Suspense } from "react";
import Cargando from "@/app/loading";

async function ContenidoVistaPrincipal() {
  await connection();
  const fecha = hoy();
  const inicio = inicioSemana(fecha);
  const [semana, siguiente, dia, catalogo] = await Promise.all([
    obtenerSemana(inicio),
    obtenerSemana(sumarDias(inicio, 7)),
    obtenerDia(fecha),
    cargarCatalogo({ incluirEliminadas: true }),
  ]);
  const almuerzo = dia && catalogo.almuerzos.get(dia.almuerzoId);
  const ensalada = dia && catalogo.ensaladas.get(dia.ensaladaId);

  return (
    <div className="space-y-5">
      <p className="text-sm font-medium uppercase tracking-wide text-suave">Hoy · {textoFecha(fecha)}</p>

      {!tieneMinuta(semana) && (
        <div role="alert" className="space-y-3 rounded-xl border border-peligro/40 bg-peligro-suave p-4">
          <p className="font-semibold text-peligro">No hay una minuta escogida para esta semana.</p>
          <Link
            href="/propuestas?semana=actual"
            className="inline-block rounded-lg bg-acento px-4 py-2 text-sm font-semibold text-acento-texto"
          >
            Elegir minuta para los días que quedan
          </Link>
        </div>
      )}

      {esFinDeSemana(fecha) && (
        <Link
          href="/propuestas"
          className="boton-fiesta block rounded-2xl px-5 py-4 text-center text-lg font-bold text-white shadow-lg"
        >
          {tieneMinuta(siguiente) ? "✨ Ver la minuta elegida para la próxima semana" : "✨ ¡Elige la minuta de la próxima semana!"}
        </Link>
      )}

      {almuerzo && ensalada ? (
        <DetalleDia
          almuerzo={almuerzo}
          ensalada={ensalada}
          sustitutoId={dia.sustitutoId}
          comensales={dia.comensales}
          catalogo={catalogo}
          prioridadImagen
        />
      ) : (
        tieneMinuta(semana) && <p className="text-suave">Hoy no hay almuerzo planificado.</p>
      )}

      <nav className="grid grid-cols-3 gap-2 pt-2">
        {[
          { href: "/semana", texto: "Vista bisemanal" },
          { href: "/ingredientes", texto: "Ingredientes" },
          { href: "/catalogo", texto: "Catálogo" },
        ].map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="rounded-xl border border-borde bg-tarjeta px-2 py-3 text-center text-sm font-semibold hover:border-acento"
          >
            {e.texto}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default function VistaPrincipal() {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoVistaPrincipal />
    </Suspense>
  );
}
