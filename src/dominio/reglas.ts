import type { Almuerzo, CatalogoIndexado, Ensalada, Grupo } from "./tipos";

// Reglas de la sección "Restricciones" del README.

export const MINIMO_SEMANAL = 2;

/** Mínimo de días con legumbres o pescados para una semana de `dias` días, redondeado hacia abajo. */
export function minimoProporcional(dias: number): number {
  return Math.floor((MINIMO_SEMANAL * dias) / 7);
}

type Receta = Pick<Almuerzo | Ensalada, "ingredientes">;

/** Ingredientes que cuentan para la regla de no repetir entre almuerzo y ensalada (excluye básicos de despensa). */
export function ingredientesComparables(receta: Receta, idx: CatalogoIndexado): Set<string> {
  return new Set(
    receta.ingredientes
      .map((l) => l.ingrediente)
      .filter((id) => !idx.ingredientes.get(id)?.basico_despensa),
  );
}

export function sonCompatibles(almuerzo: Receta, ensalada: Receta, idx: CatalogoIndexado): boolean {
  const delAlmuerzo = ingredientesComparables(almuerzo, idx);
  for (const id of ingredientesComparables(ensalada, idx)) if (delAlmuerzo.has(id)) return false;
  return true;
}

/** Si la receta tiene algún ingrediente no opcional de alguno de los grupos. */
export function tieneGrupo(receta: Receta, idx: CatalogoIndexado, grupos: Grupo[]): boolean {
  return receta.ingredientes.some((l) => {
    const grupo = idx.ingredientes.get(l.ingrediente)?.grupo;
    return !l.opcional && grupo != null && grupos.includes(grupo);
  });
}

export function contieneCarne(almuerzo: Receta, idx: CatalogoIndexado): boolean {
  return tieneGrupo(almuerzo, idx, ["carne", "pescado_marisco"]);
}

export function esDiaLegumbres(almuerzo: Receta, ensalada: Receta, idx: CatalogoIndexado): boolean {
  return tieneGrupo(almuerzo, idx, ["legumbre"]) || tieneGrupo(ensalada, idx, ["legumbre"]);
}

export function esDiaPescados(almuerzo: Receta, ensalada: Receta, idx: CatalogoIndexado): boolean {
  const grupos: Grupo[] = ["pescado_marisco", "alga"];
  return tieneGrupo(almuerzo, idx, grupos) || tieneGrupo(ensalada, idx, grupos);
}

/** Lo planificado justo antes del primer día a generar. */
export interface Antecedentes {
  /** Almuerzos de la semana anterior, que no se pueden repetir. */
  almuerzosExcluidos: string[];
  /** Días inmediatamente anteriores, del más antiguo al más reciente. */
  ultimosDias: { categoria: string; ensaladaId: string }[];
}

export const SIN_ANTECEDENTES: Antecedentes = { almuerzosExcluidos: [], ultimosDias: [] };

/** Devuelve la lista de reglas que no cumple una semana (vacía si las cumple todas). */
export function infraccionesSemana(
  dias: { almuerzo: Almuerzo; ensalada: Ensalada }[],
  antecedentes: Antecedentes,
  idx: CatalogoIndexado,
): string[] {
  const infracciones: string[] = [];
  const excluidos = new Set(antecedentes.almuerzosExcluidos);
  const vistos = new Set<string>();
  const secuencia = [
    ...antecedentes.ultimosDias,
    ...dias.map((d) => ({ categoria: d.almuerzo.categoria, ensaladaId: d.ensalada.id })),
  ];
  const desplazamiento = antecedentes.ultimosDias.length;

  dias.forEach(({ almuerzo, ensalada }, i) => {
    if (vistos.has(almuerzo.id)) infracciones.push(`Almuerzo repetido: ${almuerzo.nombre}`);
    vistos.add(almuerzo.id);
    if (excluidos.has(almuerzo.id)) infracciones.push(`Almuerzo de la semana anterior: ${almuerzo.nombre}`);
    if (!sonCompatibles(almuerzo, ensalada, idx))
      infracciones.push(`Ingredientes repetidos entre ${almuerzo.nombre} y ${ensalada.nombre}`);

    const j = i + desplazamiento;
    if (j >= 1 && secuencia[j - 1].categoria === almuerzo.categoria)
      infracciones.push(`Categoría ${almuerzo.categoria} dos días seguidos`);
    if (j >= 2 && secuencia[j - 1].ensaladaId === ensalada.id && secuencia[j - 2].ensaladaId === ensalada.id)
      infracciones.push(`${ensalada.nombre} más de dos días seguidos`);
  });

  const minimo = minimoProporcional(dias.length);
  const legumbres = dias.filter((d) => esDiaLegumbres(d.almuerzo, d.ensalada, idx)).length;
  const legumbresAlmuerzo = dias.filter((d) => tieneGrupo(d.almuerzo, idx, ["legumbre"])).length;
  const pescados = dias.filter((d) => esDiaPescados(d.almuerzo, d.ensalada, idx)).length;
  if (legumbres < minimo) infracciones.push(`Solo ${legumbres} días con legumbres (mínimo ${minimo})`);
  if (minimo >= 1 && legumbresAlmuerzo < 1) infracciones.push("Ningún almuerzo con legumbres");
  if (pescados < minimo) infracciones.push(`Solo ${pescados} días con pescados, mariscos o algas (mínimo ${minimo})`);

  const porCategoria = new Map<string, number>();
  for (const { almuerzo } of dias) porCategoria.set(almuerzo.categoria, (porCategoria.get(almuerzo.categoria) ?? 0) + 1);
  for (const [categoria, cantidad] of porCategoria) {
    const limite = idx.categorias.get(categoria)?.limite_semanal;
    if (limite != null && cantidad > limite) infracciones.push(`Categoría ${categoria} supera su límite de ${limite}`);
  }
  return infracciones;
}
