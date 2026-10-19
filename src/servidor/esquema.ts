import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { DiaPlan } from "@/dominio/tipos";

export const categorias = sqliteTable("categorias", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  limiteSemanal: integer("limite_semanal"),
  orden: integer("orden").notNull().default(0),
});

export const ingredientes = sqliteTable("ingredientes", {
  id: text("id").primaryKey(),
  nombre: text("nombre").notNull(),
  pasillo: text("pasillo").notNull(),
  grupo: text("grupo"),
  basicoDespensa: integer("basico_despensa", { mode: "boolean" }).notNull().default(false),
  unidadSingular: text("unidad_singular"),
  unidadPlural: text("unidad_plural"),
  gramosPorUnidad: real("gramos_por_unidad"),
  gramosPorCucharada: real("gramos_por_cucharada"),
});

export const sustitutosCarne = sqliteTable("sustitutos_carne", {
  ingredienteId: text("ingrediente_id").primaryKey().references(() => ingredientes.id),
  gramosPorPorcion: real("gramos_por_porcion").notNull(),
});

/** Almuerzos y ensaladas. Las recetas eliminadas se conservan (eliminada_en) para no romper el historial. */
export const recetas = sqliteTable("recetas", {
  id: text("id").primaryKey(),
  tipo: text("tipo", { enum: ["almuerzo", "ensalada"] }).notNull(),
  nombre: text("nombre").notNull(),
  categoriaId: text("categoria_id").references(() => categorias.id),
  dificultad: text("dificultad").notNull(),
  tiempoMinutos: integer("tiempo_minutos"),
  imagenUrl: text("imagen_url"),
  preparacion: text("preparacion", { mode: "json" }).$type<string[]>().notNull(),
  eliminadaEn: text("eliminada_en"),
});

export const recetaIngredientes = sqliteTable(
  "receta_ingredientes",
  {
    recetaId: text("receta_id").notNull().references(() => recetas.id),
    orden: integer("orden").notNull(),
    ingredienteId: text("ingrediente_id").notNull().references(() => ingredientes.id),
    cantidad: real("cantidad"),
    unidad: text("unidad", { enum: ["g", "cucharada"] }),
    opcional: integer("opcional", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.recetaId, t.orden] })],
);

/** Estado de cada semana: sus tres propuestas (generadas una sola vez) y cuál se eligió. */
export const semanas = sqliteTable("semanas", {
  inicio: text("inicio").primaryKey(),
  propuestas: text("propuestas", { mode: "json" }).$type<DiaPlan[][]>(),
  propuestasDesde: text("propuestas_desde"),
  seleccionada: integer("seleccionada"),
});

/** Minuta oficial: un almuerzo y una ensalada por fecha. */
export const dias = sqliteTable("dias", {
  fecha: text("fecha").primaryKey(),
  almuerzoId: text("almuerzo_id").notNull().references(() => recetas.id),
  ensaladaId: text("ensalada_id").notNull().references(() => recetas.id),
  sustitutoId: text("sustituto_id").references(() => ingredientes.id),
  comensales: integer("comensales").notNull().default(3),
  /** Comensales que comen el sustituto de carne; nunca más que `comensales`. */
  vegetarianos: integer("vegetarianos").notNull().default(1),
});
