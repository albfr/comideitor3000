import { barajar, elegir, type Aleatorio } from "./azar";
import { contieneCarne, infraccionesSemana, sonCompatibles, type Antecedentes } from "./reglas";
import type { Almuerzo, CatalogoIndexado, DiaPlan, Ensalada } from "./tipos";

// Generador provisorio: pseudoaleatorio con reintentos hasta cumplir las reglas.
// Se reemplazará por el motor definitivo (ver "Puntos por definir" en el README).

export interface EntradaGenerador {
  catalogo: CatalogoIndexado;
  fechas: string[];
  antecedentes: Antecedentes;
  azar: Aleatorio;
  cantidad?: number;
  intentos?: number;
}

export type ResultadoGenerador =
  | { ok: true; alternativas: DiaPlan[][] }
  | { ok: false; motivo: string };

function intentarSemana(entrada: EntradaGenerador): { almuerzo: Almuerzo; ensalada: Ensalada }[] | null {
  const { catalogo: idx, fechas, antecedentes, azar } = entrada;
  const excluidos = new Set(antecedentes.almuerzosExcluidos);
  const candidatos = barajar(
    idx.catalogo.almuerzos.filter((a) => !excluidos.has(a.id)),
    azar,
  );
  const historial = [...antecedentes.ultimosDias];
  const semana: { almuerzo: Almuerzo; ensalada: Ensalada }[] = [];
  const usados = new Set<string>();

  for (let i = 0; i < fechas.length; i++) {
    const categoriaAnterior = historial.at(-1)?.categoria;
    const almuerzo = candidatos.find((a) => !usados.has(a.id) && a.categoria !== categoriaAnterior);
    if (!almuerzo) return null;
    const [penultima, ultima] = [historial.at(-2)?.ensaladaId, historial.at(-1)?.ensaladaId];
    const ensaladas = idx.catalogo.ensaladas.filter(
      (e) => sonCompatibles(almuerzo, e, idx) && !(e.id === ultima && e.id === penultima),
    );
    if (ensaladas.length === 0) return null;
    const ensalada = elegir(ensaladas, azar);
    usados.add(almuerzo.id);
    semana.push({ almuerzo, ensalada });
    historial.push({ categoria: almuerzo.categoria, ensaladaId: ensalada.id });
  }
  return infraccionesSemana(semana, antecedentes, idx).length === 0 ? semana : null;
}

export function generarAlternativas(entrada: EntradaGenerador): ResultadoGenerador {
  const { catalogo: idx, fechas, azar } = entrada;
  const cantidad = entrada.cantidad ?? 3;
  const intentos = entrada.intentos ?? 5000;
  if (fechas.length === 0) return { ok: false, motivo: "No hay días que planificar." };

  const alternativas: DiaPlan[][] = [];
  const firmas = new Set<string>();
  for (let n = 0; n < intentos && alternativas.length < cantidad; n++) {
    const semana = intentarSemana(entrada);
    if (!semana) continue;
    const firma = semana.map((d) => `${d.almuerzo.id}+${d.ensalada.id}`).join(",");
    if (firmas.has(firma)) continue;
    firmas.add(firma);
    alternativas.push(
      semana.map(({ almuerzo, ensalada }, i) => ({
        fecha: fechas[i],
        almuerzoId: almuerzo.id,
        ensaladaId: ensalada.id,
        sustitutoId:
          contieneCarne(almuerzo, idx) && idx.catalogo.sustitutos_carne.length > 0
            ? elegir(idx.catalogo.sustitutos_carne, azar).ingrediente
            : null,
      })),
    );
  }

  if (alternativas.length < cantidad)
    return {
      ok: false,
      motivo:
        "No es posible generar minutas que cumplan todas las restricciones con el catálogo actual. " +
        "Agrega más almuerzos o ensaladas, o revisa las categorías.",
    };
  return { ok: true, alternativas };
}
