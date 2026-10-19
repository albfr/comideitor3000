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

/**
 * Dueño provisorio de las minutas creadas antes de que existieran usuarios. Se reasignan a una
 * cuenta con `npm run db:asignar-minutas -- <email>`.
 */
export const SIN_USUARIO = "__sin_usuario__";

/** Estado de cada semana de un usuario: sus tres propuestas (generadas una sola vez) y cuál eligió. */
export const semanas = sqliteTable(
  "semanas",
  {
    usuarioId: text("usuario_id").notNull(),
    inicio: text("inicio").notNull(),
    propuestas: text("propuestas", { mode: "json" }).$type<DiaPlan[][]>(),
    propuestasDesde: text("propuestas_desde"),
    seleccionada: integer("seleccionada"),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.inicio] })],
);

/** Minuta oficial de un usuario: un almuerzo y una ensalada por fecha, con sus comensales. */
export const dias = sqliteTable(
  "dias",
  {
    usuarioId: text("usuario_id").notNull(),
    fecha: text("fecha").notNull(),
    almuerzoId: text("almuerzo_id").notNull().references(() => recetas.id),
    ensaladaId: text("ensalada_id").notNull().references(() => recetas.id),
    sustitutoId: text("sustituto_id").references(() => ingredientes.id),
    comensales: integer("comensales").notNull().default(3),
    /** Comensales que comen el sustituto de carne; nunca más que `comensales`. */
    vegetarianos: integer("vegetarianos").notNull().default(1),
  },
  (t) => [primaryKey({ columns: [t.usuarioId, t.fecha] })],
);

// --- Tablas de Better Auth (inicio de sesión con Google) ---

const fecha = (nombre: string) => integer(nombre, { mode: "timestamp_ms" });

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: fecha("created_at").notNull(),
  updatedAt: fecha("updated_at").notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: fecha("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: fecha("created_at").notNull(),
  updatedAt: fecha("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: fecha("access_token_expires_at"),
  refreshTokenExpiresAt: fecha("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: fecha("created_at").notNull(),
  updatedAt: fecha("updated_at").notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: fecha("expires_at").notNull(),
  createdAt: fecha("created_at").notNull(),
  updatedAt: fecha("updated_at").notNull(),
});
