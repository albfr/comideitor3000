import type { DiaPlan } from "./tipos";

/** Mueve el elemento de `desde` a `hasta`; los intermedios se desplazan. */
export function moverElemento<T>(lista: readonly T[], desde: number, hasta: number): T[] {
  const copia = [...lista];
  const [elemento] = copia.splice(desde, 1);
  copia.splice(hasta, 0, elemento);
  return copia;
}

/**
 * Reasigna el contenido (almuerzo, ensalada y sustituto) de los días según un nuevo orden.
 * `nuevoOrden[i]` es la fecha cuyo contenido pasa a la posición i. Las fechas no se mueven
 * (los comensales pertenecen a la fecha, no al plato).
 */
export function reasignarContenidos(dias: readonly DiaPlan[], nuevoOrden: readonly string[]): DiaPlan[] {
  const ordenados = [...dias].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const porFecha = new Map(ordenados.map((d) => [d.fecha, d]));
  if (nuevoOrden.length !== ordenados.length || new Set(nuevoOrden).size !== nuevoOrden.length || nuevoOrden.some((f) => !porFecha.has(f)))
    throw new Error("El nuevo orden debe ser una permutación de las fechas editables");
  return ordenados.map((dia, i) => {
    const origen = porFecha.get(nuevoOrden[i])!;
    return { fecha: dia.fecha, almuerzoId: origen.almuerzoId, ensaladaId: origen.ensaladaId, sustitutoId: origen.sustitutoId };
  });
}
