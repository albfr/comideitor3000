import { and, asc, eq, gte, lte } from "drizzle-orm";
import type { Aleatorio } from "@/dominio/azar";
import { inicioSemana, sumarDias } from "@/dominio/fechas";
import { generarAlternativas } from "@/dominio/generador";
import type { Antecedentes } from "@/dominio/reglas";
import { reasignarContenidos } from "@/dominio/reordenar";
import type { CatalogoIndexado, DiaPlan } from "@/dominio/tipos";
import { db } from "./db";
import { dias, semanas } from "./esquema";

export const COMENSALES_POR_DEFECTO = 3;
export const VEGETARIANOS_POR_DEFECTO = 1;

export type FilaDia = typeof dias.$inferSelect;
export type FilaSemana = typeof semanas.$inferSelect;

// Todas las minutas pertenecen a un usuario: cada consulta filtra por usuarioId.

const deSemana = (usuarioId: string, inicio: string) => and(eq(semanas.usuarioId, usuarioId), eq(semanas.inicio, inicio));
const deDia = (usuarioId: string, fecha: string) => and(eq(dias.usuarioId, usuarioId), eq(dias.fecha, fecha));

export async function obtenerSemana(usuarioId: string, inicio: string): Promise<FilaSemana | undefined> {
  const [fila] = await db.select().from(semanas).where(deSemana(usuarioId, inicio));
  return fila;
}

export function tieneMinuta(semana: FilaSemana | undefined): boolean {
  return semana?.seleccionada != null;
}

export async function obtenerDias(usuarioId: string, desde: string, hasta: string): Promise<FilaDia[]> {
  return db
    .select()
    .from(dias)
    .where(and(eq(dias.usuarioId, usuarioId), gte(dias.fecha, desde), lte(dias.fecha, hasta)))
    .orderBy(asc(dias.fecha));
}

export async function obtenerDia(usuarioId: string, fecha: string): Promise<FilaDia | undefined> {
  const [fila] = await db.select().from(dias).where(deDia(usuarioId, fecha));
  return fila;
}

/** Almuerzos de la semana anterior y los dos días previos a `desde`, para encadenar las reglas. */
async function antecedentesPara(usuarioId: string, desde: string, idx: CatalogoIndexado): Promise<Antecedentes> {
  const lunesAnterior = sumarDias(inicioSemana(desde), -7);
  const [semanaAnterior, previos] = await Promise.all([
    obtenerDias(usuarioId, lunesAnterior, sumarDias(lunesAnterior, 6)),
    obtenerDias(usuarioId, sumarDias(desde, -2), sumarDias(desde, -1)),
  ]);
  return {
    almuerzosExcluidos: semanaAnterior.map((d) => d.almuerzoId),
    ultimosDias: previos.map((d) => ({
      categoria: idx.almuerzos.get(d.almuerzoId)?.categoria ?? "",
      ensaladaId: d.ensaladaId,
    })),
  };
}

export type EstadoPropuestas =
  | { estado: "elegida"; seleccionada: number }
  | { estado: "propuestas"; propuestas: DiaPlan[][] }
  | { estado: "error"; motivo: string };

/**
 * Devuelve las propuestas de la semana `inicio` para las fechas `fechas`. Se generan una sola vez
 * y se guardan; solo se regeneran si cubrían otro rango de días (una semana parcial desactualizada).
 */
export async function obtenerPropuestas(
  usuarioId: string,
  inicio: string,
  fechas: string[],
  catalogoGeneracion: CatalogoIndexado,
  azar: Aleatorio = Math.random,
): Promise<EstadoPropuestas> {
  const semana = await obtenerSemana(usuarioId, inicio);
  if (semana?.seleccionada != null) return { estado: "elegida", seleccionada: semana.seleccionada };
  if (semana?.propuestas && semana.propuestasDesde === fechas[0]) return { estado: "propuestas", propuestas: semana.propuestas };

  const antecedentes = await antecedentesPara(usuarioId, fechas[0], catalogoGeneracion);
  const resultado = generarAlternativas({ catalogo: catalogoGeneracion, fechas, antecedentes, azar });
  if (!resultado.ok) return { estado: "error", motivo: resultado.motivo };

  const valores = { usuarioId, inicio, propuestas: resultado.alternativas, propuestasDesde: fechas[0] };
  if (semana) {
    await db.update(semanas).set(valores).where(deSemana(usuarioId, inicio));
  } else {
    // Si otra petición las generó al mismo tiempo, se conservan las primeras.
    await db.insert(semanas).values(valores).onConflictDoNothing();
  }
  const guardada = await obtenerSemana(usuarioId, inicio);
  return { estado: "propuestas", propuestas: guardada?.propuestas ?? resultado.alternativas };
}

/** Fija una alternativa como minuta oficial. No se puede cambiar una vez elegida (RF-12). */
export async function seleccionarPropuesta(usuarioId: string, inicio: string, indice: number, hoy: string) {
  const semana = await obtenerSemana(usuarioId, inicio);
  if (!semana?.propuestas) throw new Error("No hay propuestas para esta semana");
  if (semana.seleccionada != null) throw new Error("La minuta de esta semana ya fue elegida");
  const alternativa = semana.propuestas[indice];
  if (!alternativa) throw new Error("Alternativa inválida");

  const futuros = alternativa.filter((d) => d.fecha >= hoy);
  await db.batch([
    db.update(semanas).set({ seleccionada: indice }).where(deSemana(usuarioId, inicio)),
    ...futuros.map((d) =>
      db
        .insert(dias)
        .values({ ...d, usuarioId, comensales: COMENSALES_POR_DEFECTO, vegetarianos: VEGETARIANOS_POR_DEFECTO })
        .onConflictDoUpdate({
          target: [dias.usuarioId, dias.fecha],
          set: { almuerzoId: d.almuerzoId, ensaladaId: d.ensaladaId, sustitutoId: d.sustitutoId },
        }),
    ),
  ]);
}

/** Reordena los días editables (desde hoy) de una semana. `nuevoOrden[i]` es la fecha cuyo contenido va en la posición i. */
export async function reordenarSemana(usuarioId: string, inicio: string, nuevoOrden: string[], hoy: string) {
  const filas = await obtenerDias(usuarioId, inicio, sumarDias(inicio, 6));
  const editables = filas.filter((d) => d.fecha >= hoy);
  const [primero, ...resto] = reasignarContenidos(editables, nuevoOrden).map((d) =>
    db
      .update(dias)
      .set({ almuerzoId: d.almuerzoId, ensaladaId: d.ensaladaId, sustitutoId: d.sustitutoId })
      .where(deDia(usuarioId, d.fecha)),
  );
  if (primero) await db.batch([primero, ...resto]);
}

async function diaEditable(usuarioId: string, fecha: string, hoy: string): Promise<FilaDia> {
  if (fecha < hoy) throw new Error("No se pueden modificar días pasados");
  const dia = await obtenerDia(usuarioId, fecha);
  if (!dia) throw new Error("El día no tiene minuta");
  return dia;
}

/** Suma o resta comensales a un día que aún no pasa, con un mínimo de 1. Los vegetarianos nunca superan a los comensales. */
export async function cambiarComensales(usuarioId: string, fecha: string, delta: number, hoy: string) {
  const dia = await diaEditable(usuarioId, fecha, hoy);
  const comensales = Math.max(1, dia.comensales + Math.sign(delta));
  await db
    .update(dias)
    .set({ comensales, vegetarianos: Math.min(dia.vegetarianos, comensales) })
    .where(deDia(usuarioId, fecha));
}

/** Suma o resta comensales vegetarianos a un día que aún no pasa, entre 0 y el total de comensales. */
export async function cambiarVegetarianos(usuarioId: string, fecha: string, delta: number, hoy: string) {
  const dia = await diaEditable(usuarioId, fecha, hoy);
  const vegetarianos = Math.min(dia.comensales, Math.max(0, dia.vegetarianos + Math.sign(delta)));
  await db.update(dias).set({ vegetarianos }).where(deDia(usuarioId, fecha));
}
