import { asc, eq, isNull } from "drizzle-orm";
import { indexar, type Almuerzo, type Catalogo, type CatalogoIndexado, type Ensalada, type Ingrediente, type LineaIngrediente } from "@/dominio/tipos";
import { db, type BaseDeDatos } from "./db";
import { categorias, ingredientes, recetaIngredientes, recetas, sustitutosCarne } from "./esquema";

type FilaIngrediente = typeof ingredientes.$inferSelect;
type FilaLinea = typeof recetaIngredientes.$inferSelect;

function aIngrediente(fila: FilaIngrediente): Ingrediente {
  return {
    id: fila.id,
    nombre: fila.nombre,
    pasillo: fila.pasillo,
    grupo: (fila.grupo as Ingrediente["grupo"]) ?? null,
    basico_despensa: fila.basicoDespensa,
    unidad:
      fila.unidadSingular && fila.unidadPlural && fila.gramosPorUnidad
        ? { singular: fila.unidadSingular, plural: fila.unidadPlural, gramos: fila.gramosPorUnidad }
        : null,
    gramos_por_cucharada: fila.gramosPorCucharada,
  };
}

function aLinea(fila: FilaLinea): LineaIngrediente {
  return fila.opcional
    ? { ingrediente: fila.ingredienteId, opcional: true }
    : { ingrediente: fila.ingredienteId, cantidad: fila.cantidad ?? 0, unidad: fila.unidad ?? "g" };
}

/**
 * Lee el catálogo desde la base de datos. Con `incluirEliminadas` también trae las recetas
 * eliminadas, necesarias para mostrar minutas que las usan.
 */
export async function cargarCatalogo({ incluirEliminadas = false } = {}): Promise<CatalogoIndexado> {
  const [filasCategorias, filasIngredientes, filasSustitutos, filasRecetas, filasLineas] = await Promise.all([
    db.select().from(categorias).orderBy(asc(categorias.orden)),
    db.select().from(ingredientes).orderBy(asc(ingredientes.nombre)),
    db.select().from(sustitutosCarne),
    incluirEliminadas
      ? db.select().from(recetas).orderBy(asc(recetas.nombre))
      : db.select().from(recetas).where(isNull(recetas.eliminadaEn)).orderBy(asc(recetas.nombre)),
    db.select().from(recetaIngredientes).orderBy(asc(recetaIngredientes.orden)),
  ]);

  const lineasPorReceta = new Map<string, LineaIngrediente[]>();
  for (const fila of filasLineas)
    lineasPorReceta.set(fila.recetaId, [...(lineasPorReceta.get(fila.recetaId) ?? []), aLinea(fila)]);

  const almuerzos: Almuerzo[] = [];
  const ensaladas: Ensalada[] = [];
  for (const r of filasRecetas) {
    const lineas = lineasPorReceta.get(r.id) ?? [];
    if (r.tipo === "almuerzo")
      almuerzos.push({
        id: r.id,
        nombre: r.nombre,
        categoria: r.categoriaId ?? "",
        dificultad: r.dificultad as Almuerzo["dificultad"],
        tiempo_minutos: r.tiempoMinutos ?? 0,
        imagen: r.imagenUrl,
        ingredientes: lineas,
        preparacion: r.preparacion,
      });
    else ensaladas.push({ id: r.id, nombre: r.nombre, dificultad: r.dificultad as Ensalada["dificultad"], ingredientes: lineas });
  }

  const catalogo: Catalogo = {
    categorias_almuerzo: filasCategorias.map((c) => ({ id: c.id, nombre: c.nombre, limite_semanal: c.limiteSemanal })),
    ingredientes: filasIngredientes.map(aIngrediente),
    sustitutos_carne: filasSustitutos.map((s) => ({ ingrediente: s.ingredienteId, gramos_por_porcion: s.gramosPorPorcion })),
    almuerzos,
    ensaladas,
  };
  return indexar(catalogo);
}

export async function idsDeRecetas(): Promise<Set<string>> {
  const filas = await db.select({ id: recetas.id }).from(recetas);
  return new Set(filas.map((f) => f.id));
}

function filasDeLineas(recetaId: string, lineas: LineaIngrediente[]) {
  return lineas.map((l, orden) => ({
    recetaId,
    orden,
    ingredienteId: l.ingrediente,
    cantidad: l.opcional ? null : l.cantidad,
    unidad: l.opcional ? null : l.unidad,
    opcional: !!l.opcional,
  }));
}

/** Crea o actualiza una receta con sus ingredientes. `imagenUrl` undefined conserva la imagen actual. */
export async function guardarReceta(
  receta: { tipo: "almuerzo"; datos: Almuerzo; imagenUrl?: string | null } | { tipo: "ensalada"; datos: Ensalada },
  base: BaseDeDatos = db,
) {
  const { datos } = receta;
  const valores = {
    id: datos.id,
    tipo: receta.tipo,
    nombre: datos.nombre,
    dificultad: datos.dificultad,
    categoriaId: receta.tipo === "almuerzo" ? receta.datos.categoria : null,
    tiempoMinutos: receta.tipo === "almuerzo" ? receta.datos.tiempo_minutos : null,
    preparacion: receta.tipo === "almuerzo" ? receta.datos.preparacion : [],
  };
  const imagen = receta.tipo === "almuerzo" && receta.imagenUrl !== undefined ? { imagenUrl: receta.imagenUrl } : {};
  await base.batch([
    base
      .insert(recetas)
      .values({ ...valores, ...imagen })
      .onConflictDoUpdate({ target: recetas.id, set: { ...valores, ...imagen } }),
    base.delete(recetaIngredientes).where(eq(recetaIngredientes.recetaId, datos.id)),
    ...(datos.ingredientes.length ? [base.insert(recetaIngredientes).values(filasDeLineas(datos.id, datos.ingredientes))] : []),
  ]);
}

export async function eliminarReceta(id: string) {
  await db.update(recetas).set({ eliminadaEn: new Date().toISOString() }).where(eq(recetas.id, id));
}

export async function guardarIngrediente(ingrediente: Ingrediente, base: BaseDeDatos = db) {
  const valores = {
    id: ingrediente.id,
    nombre: ingrediente.nombre,
    pasillo: ingrediente.pasillo,
    grupo: ingrediente.grupo ?? null,
    basicoDespensa: !!ingrediente.basico_despensa,
    unidadSingular: ingrediente.unidad?.singular ?? null,
    unidadPlural: ingrediente.unidad?.plural ?? null,
    gramosPorUnidad: ingrediente.unidad?.gramos ?? null,
    gramosPorCucharada: ingrediente.gramos_por_cucharada ?? null,
  };
  await base.insert(ingredientes).values(valores).onConflictDoUpdate({ target: ingredientes.id, set: valores });
}

/** Identificador legible y único a partir de un nombre: "Pollo al jugo" → "pollo_al_jugo". */
export function crearId(nombre: string, existentes: Set<string>): string {
  const base =
    nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/ñ/g, "n")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "receta";
  let id = base;
  for (let n = 2; existentes.has(id); n++) id = `${base}_${n}`;
  return id;
}
