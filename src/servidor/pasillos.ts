import clasificacion from "../../prompt_clasificacion_alimentos.json";

export interface Pasillo {
  id: string;
  nombre: string;
}

/** Pasillos del supermercado, en el orden de prompt_clasificacion_alimentos.json. */
export const PASILLOS: Pasillo[] = clasificacion["categorías"].map((c) => ({ id: c.id, nombre: c.nombre }));
export const ORDEN_PASILLOS = PASILLOS.map((p) => p.id);
export const IDS_PASILLOS = new Set(ORDEN_PASILLOS);

export function nombrePasillo(id: string): string {
  return PASILLOS.find((p) => p.id === id)?.nombre ?? id;
}
