import Link from "next/link";
import { connection } from "next/server";
import { textoFecha } from "@/componentes/formato";
import { SemanaEditable, type DiaSemana } from "@/componentes/SemanaEditable";
import { diasDeSemana, hoy, inicioSemana, sumarDias } from "@/dominio/fechas";
import { cargarCatalogo } from "@/servidor/catalogo";
import { obtenerDias, obtenerSemana, tieneMinuta } from "@/servidor/minutas";
import { Suspense } from "react";
import Cargando from "@/app/loading";

/** Vista bisemanal: semana actual y, si ya se eligió, la siguiente (RF-17). */
async function ContenidoVistaBisemanal() {
  await connection();
  const fecha = hoy();
  const inicio = inicioSemana(fecha);
  const inicioSiguiente = sumarDias(inicio, 7);
  const [actual, siguiente, filas, catalogo] = await Promise.all([
    obtenerSemana(inicio),
    obtenerSemana(inicioSiguiente),
    obtenerDias(inicio, sumarDias(inicio, 13)),
    cargarCatalogo({ incluirEliminadas: true }),
  ]);
  const porFecha = new Map(filas.map((f) => [f.fecha, f]));

  const diasDe = (lunes: string): DiaSemana[] =>
    diasDeSemana(lunes).map((f) => {
      const fila = porFecha.get(f);
      const almuerzo = fila && catalogo.almuerzos.get(fila.almuerzoId);
      const ensalada = fila && catalogo.ensaladas.get(fila.ensaladaId);
      return {
        fecha: f,
        etiqueta: textoFecha(f),
        esHoy: f === fecha,
        pasado: f < fecha,
        comensales: fila?.comensales ?? null,
        contenido:
          almuerzo && ensalada
            ? {
                almuerzo: almuerzo.nombre,
                ensalada: ensalada.nombre,
                categoria: catalogo.categorias.get(almuerzo.categoria)?.nombre ?? almuerzo.categoria,
              }
            : null,
      };
    });

  const semanas = [{ inicio, titulo: "Esta semana", dias: diasDe(inicio) }];
  if (tieneMinuta(siguiente)) semanas.push({ inicio: inicioSiguiente, titulo: "Próxima semana", dias: diasDe(inicioSiguiente) });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Minuta bisemanal</h1>
        <p className="text-sm text-suave">
          Arrastra un día desde ⠿ para cambiar su posición. Usa − y + para ajustar los comensales. Toca un plato para ver su
          detalle.
        </p>
      </header>

      {!tieneMinuta(actual) && (
        <div role="alert" className="space-y-2 rounded-xl border border-peligro/40 bg-peligro-suave p-4">
          <p className="font-semibold text-peligro">No hay una minuta escogida para esta semana.</p>
          <Link href="/propuestas?semana=actual" className="text-sm font-semibold text-acento">
            Elegir minuta para los días que quedan →
          </Link>
        </div>
      )}

      {semanas.map((s) => (
        <section key={s.inicio} className="space-y-3">
          <h2 className="text-lg font-semibold">{s.titulo}</h2>
          <SemanaEditable
            key={JSON.stringify(s.dias.map((d) => [d.fecha, d.contenido?.almuerzo, d.contenido?.ensalada]))}
            inicio={s.inicio}
            dias={s.dias}
          />
        </section>
      ))}
    </div>
  );
}

export default function VistaBisemanal() {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoVistaBisemanal />
    </Suspense>
  );
}
