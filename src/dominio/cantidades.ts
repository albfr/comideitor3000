import type { Ingrediente, LineaIngrediente, UnidadCompra } from "./tipos";

const numero = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 1 });

export function formatearNumero(n: number): string {
  return numero.format(n);
}

/** 1200 → "1,2 kg"; 150 → "150 g" (RNF-11). */
export function formatearGramos(gramos: number): string {
  if (gramos >= 1000) return `${numero.format(Math.round(gramos / 100) / 10)} kg`;
  return `${Math.round(gramos)} g`;
}

/** Unidades aproximadas a la media unidad más cercana, con un mínimo de 0,5. */
export function aproximarUnidades(gramos: number, gramosPorUnidad: number): number {
  return Math.max(0.5, Math.round((gramos / gramosPorUnidad) * 2) / 2);
}

export function textoUnidades(gramos: number, unidad: UnidadCompra): string {
  const n = aproximarUnidades(gramos, unidad.gramos);
  return `${numero.format(n)} ${n === 1 ? unidad.singular : unidad.plural}`;
}

/** "150 g (1,5 tomates medianos)", o solo "150 g" si el ingrediente no tiene unidad de compra. */
export function textoCantidad(gramos: number, ingrediente: Ingrediente): string {
  const base = formatearGramos(gramos);
  return ingrediente.unidad ? `${base} (${textoUnidades(gramos, ingrediente.unidad)})` : base;
}

/** Texto de una línea de receta para `porciones` comensales, por ejemplo "150 g de tomate (1,5 tomates medianos)". */
export function textoLinea(linea: LineaIngrediente, ingrediente: Ingrediente, porciones: number): string {
  if (linea.opcional) return `${ingrediente.nombre} (al gusto)`;
  const cantidad = linea.cantidad * porciones;
  if (linea.unidad === "cucharada")
    return `${numero.format(cantidad)} ${cantidad === 1 ? "cucharada" : "cucharadas"} de ${ingrediente.nombre}`;
  const base = `${formatearGramos(cantidad)} de ${ingrediente.nombre}`;
  return ingrediente.unidad ? `${base} (${textoUnidades(cantidad, ingrediente.unidad)})` : base;
}

/** Gramos de una línea no opcional, convirtiendo cucharadas. */
export function gramosDeLinea(linea: LineaIngrediente, ingrediente: Ingrediente): number {
  if (linea.opcional) return 0;
  if (linea.unidad === "g") return linea.cantidad;
  if (!ingrediente.gramos_por_cucharada)
    throw new Error(`El ingrediente ${ingrediente.id} se usa en cucharadas pero no tiene gramos_por_cucharada`);
  return linea.cantidad * ingrediente.gramos_por_cucharada;
}
