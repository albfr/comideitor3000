import { DIFICULTADES, DIFICULTADES_ENSALADA, GRUPOS, type Catalogo, type Ingrediente, type LineaIngrediente } from "./tipos";

/** Revisa las líneas de ingrediente de una receta. Devuelve los errores encontrados. */
export function validarLineas(
  recetaId: string,
  lineas: LineaIngrediente[],
  ingredientes: Map<string, Ingrediente>,
): string[] {
  const errores: string[] = [];
  const vistos = new Set<string>();
  if (lineas.length === 0) errores.push(`${recetaId}: debe tener al menos un ingrediente`);
  for (const l of lineas) {
    const ingrediente = ingredientes.get(l.ingrediente);
    if (!ingrediente) {
      errores.push(`${recetaId}: ingrediente desconocido "${l.ingrediente}"`);
      continue;
    }
    if (vistos.has(l.ingrediente)) errores.push(`${recetaId}: ingrediente repetido "${ingrediente.nombre}"`);
    vistos.add(l.ingrediente);
    if (l.opcional) continue;
    if (!(l.cantidad > 0) || (l.unidad !== "g" && l.unidad !== "cucharada"))
      errores.push(`${recetaId}: cantidad o unidad inválida para "${ingrediente.nombre}"`);
    else if (l.unidad === "cucharada" && !ingrediente.gramos_por_cucharada)
      errores.push(`${recetaId}: "${ingrediente.nombre}" no tiene equivalencia en gramos por cucharada`);
  }
  return errores;
}

export function validarCatalogo(catalogo: Catalogo, pasillos: Set<string>): string[] {
  const errores: string[] = [];
  const ingredientes = new Map<string, Ingrediente>();
  for (const i of catalogo.ingredientes) {
    if (ingredientes.has(i.id)) errores.push(`Ingrediente duplicado: ${i.id}`);
    ingredientes.set(i.id, i);
    if (!pasillos.has(i.pasillo)) errores.push(`${i.id}: pasillo desconocido "${i.pasillo}"`);
    if (i.grupo != null && !GRUPOS.includes(i.grupo)) errores.push(`${i.id}: grupo inválido "${i.grupo}"`);
    if (i.unidad && !(i.unidad.singular && i.unidad.plural && i.unidad.gramos > 0))
      errores.push(`${i.id}: unidad incompleta`);
  }

  const categorias = new Set(catalogo.categorias_almuerzo.map((c) => c.id));
  for (const s of catalogo.sustitutos_carne) {
    if (ingredientes.get(s.ingrediente)?.grupo !== "sustituto_carne")
      errores.push(`Sustituto ${s.ingrediente}: debe ser un ingrediente del grupo sustituto_carne`);
    if (!(s.gramos_por_porcion > 0)) errores.push(`Sustituto ${s.ingrediente}: gramos_por_porcion inválido`);
  }

  const ids = new Set<string>();
  const registrar = (id: string) => {
    if (ids.has(id)) errores.push(`Receta duplicada: ${id}`);
    ids.add(id);
  };
  for (const a of catalogo.almuerzos) {
    registrar(a.id);
    if (!categorias.has(a.categoria)) errores.push(`${a.id}: categoría desconocida "${a.categoria}"`);
    if (!DIFICULTADES.includes(a.dificultad)) errores.push(`${a.id}: dificultad inválida`);
    if (!(a.tiempo_minutos > 0)) errores.push(`${a.id}: tiempo inválido`);
    if (a.preparacion.length === 0) errores.push(`${a.id}: falta la preparación`);
    errores.push(...validarLineas(a.id, a.ingredientes, ingredientes));
  }
  for (const e of catalogo.ensaladas) {
    registrar(e.id);
    if (!DIFICULTADES_ENSALADA.includes(e.dificultad)) errores.push(`${e.id}: dificultad inválida`);
    errores.push(...validarLineas(e.id, e.ingredientes, ingredientes));
  }
  return errores;
}
