// Carga data/catalogo.json para las pruebas.
import catalogoJson from "../../data/catalogo.json";
import clasificacion from "../../prompt_clasificacion_alimentos.json";
import type { Catalogo } from "./tipos";

export const catalogoInicial = catalogoJson as unknown as Catalogo;
export const pasillosValidos = new Set(clasificacion["categorías"].map((c) => c.id));
