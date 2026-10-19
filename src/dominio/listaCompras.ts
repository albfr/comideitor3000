import { gramosDeLinea, porcionesDeLinea, textoCantidad } from "./cantidades";
import type { Almuerzo, CatalogoIndexado, Ensalada, Ingrediente } from "./tipos";

export interface DiaConsumo {
  comensales: number;
  /** Comensales que comen el sustituto en vez de carne, ave, pescado o mariscos. */
  vegetarianos: number;
  almuerzo: Almuerzo;
  ensalada: Ensalada;
  sustitutoId: string | null;
}

export interface ItemCompra {
  ingrediente: Ingrediente;
  gramos: number;
  /** Solo aparece como "al gusto": no hay cantidad que sumar. */
  soloOpcional: boolean;
  texto: string;
}

export interface SeccionCompra {
  pasillo: string;
  items: ItemCompra[];
}

/**
 * Lista de compras (RF-13 a RF-16): suma por ingrediente, escala por comensales y agrupa por pasillo.
 * La carne se calcula para los no vegetarianos y el sustituto para los vegetarianos.
 */
export function calcularListaCompras(
  dias: DiaConsumo[],
  idx: CatalogoIndexado,
  ordenPasillos: string[] = [],
): SeccionCompra[] {
  // Los ingredientes opcionales suman 0 g: si nadie aporta cantidad, quedan "al gusto".
  const totales = new Map<string, number>();
  const sumar = (id: string, gramos: number) => {
    const ingrediente = idx.ingredientes.get(id);
    if (!ingrediente) throw new Error(`Ingrediente desconocido: ${id}`);
    if (ingrediente.basico_despensa) return;
    totales.set(id, (totales.get(id) ?? 0) + gramos);
  };

  for (const dia of dias) {
    for (const receta of [dia.almuerzo, dia.ensalada]) {
      for (const linea of receta.ingredientes) {
        const ingrediente = idx.ingredientes.get(linea.ingrediente);
        if (!ingrediente) throw new Error(`Ingrediente desconocido: ${linea.ingrediente}`);
        if (linea.opcional) {
          sumar(linea.ingrediente, 0);
          continue;
        }
        const porciones = porcionesDeLinea(ingrediente, dia.comensales, dia.vegetarianos);
        if (porciones > 0) sumar(linea.ingrediente, gramosDeLinea(linea, ingrediente) * porciones);
      }
    }
    const sustituto = dia.sustitutoId ? idx.sustitutos.get(dia.sustitutoId) : undefined;
    if (sustituto && dia.vegetarianos > 0) sumar(sustituto.ingrediente, sustituto.gramos_por_porcion * dia.vegetarianos);
  }

  const secciones = new Map<string, ItemCompra[]>();
  for (const [id, gramos] of totales) {
    const ingrediente = idx.ingredientes.get(id)!;
    const soloOpcional = gramos === 0;
    const item: ItemCompra = {
      ingrediente,
      gramos,
      soloOpcional,
      texto: soloOpcional ? "al gusto" : textoCantidad(gramos, ingrediente),
    };
    secciones.set(ingrediente.pasillo, [...(secciones.get(ingrediente.pasillo) ?? []), item]);
  }

  const posicion = (pasillo: string) => {
    const i = ordenPasillos.indexOf(pasillo);
    return i === -1 ? ordenPasillos.length : i;
  };
  return [...secciones.entries()]
    .sort(([a], [b]) => posicion(a) - posicion(b) || a.localeCompare(b))
    .map(([pasillo, items]) => ({
      pasillo,
      items: items.sort((a, b) => a.ingrediente.nombre.localeCompare(b.ingrediente.nombre, "es")),
    }));
}
