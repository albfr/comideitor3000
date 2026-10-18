// Tipos del catálogo. Los nombres de campos siguen el formato de data/catalogo.json (ver data/FORMATO.md).

export type Dificultad = "baja" | "media" | "alta" | "muy_alta";
export type DificultadEnsalada = "baja" | "media";
export type Grupo = "legumbre" | "carne" | "pescado_marisco" | "alga" | "sustituto_carne";

export const DIFICULTADES: Dificultad[] = ["baja", "media", "alta", "muy_alta"];
export const DIFICULTADES_ENSALADA: DificultadEnsalada[] = ["baja", "media"];
export const GRUPOS: Grupo[] = ["legumbre", "carne", "pescado_marisco", "alga", "sustituto_carne"];

export interface UnidadCompra {
  singular: string;
  plural: string;
  gramos: number;
}

export interface Ingrediente {
  id: string;
  nombre: string;
  pasillo: string;
  grupo?: Grupo | null;
  basico_despensa?: boolean;
  unidad?: UnidadCompra | null;
  gramos_por_cucharada?: number | null;
}

export type LineaIngrediente =
  | { ingrediente: string; opcional: true; cantidad?: undefined; unidad?: undefined }
  | { ingrediente: string; cantidad: number; unidad: "g" | "cucharada"; opcional?: false };

export interface Categoria {
  id: string;
  nombre: string;
  limite_semanal: number | null;
}

export interface Almuerzo {
  id: string;
  nombre: string;
  categoria: string;
  dificultad: Dificultad;
  tiempo_minutos: number;
  imagen: string | null;
  ingredientes: LineaIngrediente[];
  preparacion: string[];
}

export interface Ensalada {
  id: string;
  nombre: string;
  dificultad: DificultadEnsalada;
  ingredientes: LineaIngrediente[];
}

export interface SustitutoCarne {
  ingrediente: string;
  gramos_por_porcion: number;
}

export interface Catalogo {
  categorias_almuerzo: Categoria[];
  ingredientes: Ingrediente[];
  sustitutos_carne: SustitutoCarne[];
  almuerzos: Almuerzo[];
  ensaladas: Ensalada[];
}

/** Un día planificado: qué se cocina en una fecha (YYYY-MM-DD). */
export interface DiaPlan {
  fecha: string;
  almuerzoId: string;
  ensaladaId: string;
  sustitutoId: string | null;
}

export interface CatalogoIndexado {
  catalogo: Catalogo;
  ingredientes: Map<string, Ingrediente>;
  almuerzos: Map<string, Almuerzo>;
  ensaladas: Map<string, Ensalada>;
  categorias: Map<string, Categoria>;
  sustitutos: Map<string, SustitutoCarne>;
}

export function indexar(catalogo: Catalogo): CatalogoIndexado {
  return {
    catalogo,
    ingredientes: new Map(catalogo.ingredientes.map((i) => [i.id, i])),
    almuerzos: new Map(catalogo.almuerzos.map((a) => [a.id, a])),
    ensaladas: new Map(catalogo.ensaladas.map((e) => [e.id, e])),
    categorias: new Map(catalogo.categorias_almuerzo.map((c) => [c.id, c])),
    sustitutos: new Map(catalogo.sustitutos_carne.map((s) => [s.ingrediente, s])),
  };
}
