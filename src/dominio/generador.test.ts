import { describe, expect, it } from "vitest";
import { conSemilla } from "./azar";
import { catalogoInicial } from "./catalogoDePrueba";
import { diasDeSemana, diasRestantes } from "./fechas";
import { generarAlternativas } from "./generador";
import { contieneCarne, infraccionesSemana, SIN_ANTECEDENTES, type Antecedentes } from "./reglas";
import { indexar, type DiaPlan } from "./tipos";

const idx = indexar(catalogoInicial);
const semana = diasDeSemana("2026-10-19");

function expandir(dias: DiaPlan[]) {
  return dias.map((d) => ({ almuerzo: idx.almuerzos.get(d.almuerzoId)!, ensalada: idx.ensaladas.get(d.ensaladaId)! }));
}

function antecedentesDe(dias: DiaPlan[]): Antecedentes {
  const expandidos = expandir(dias);
  return {
    almuerzosExcluidos: dias.map((d) => d.almuerzoId),
    ultimosDias: expandidos.slice(-2).map((d) => ({ categoria: d.almuerzo.categoria, ensaladaId: d.ensalada.id })),
  };
}

describe("generador de minutas", () => {
  it("genera tres alternativas distintas que cumplen todas las reglas", () => {
    for (let semilla = 1; semilla <= 40; semilla++) {
      const resultado = generarAlternativas({ catalogo: idx, fechas: semana, antecedentes: SIN_ANTECEDENTES, azar: conSemilla(semilla) });
      expect(resultado.ok).toBe(true);
      if (!resultado.ok) return;
      expect(resultado.alternativas).toHaveLength(3);
      const firmas = new Set(resultado.alternativas.map((a) => JSON.stringify(a)));
      expect(firmas.size).toBe(3);
      for (const alternativa of resultado.alternativas) {
        expect(alternativa.map((d) => d.fecha)).toEqual(semana);
        expect(infraccionesSemana(expandir(alternativa), SIN_ANTECEDENTES, idx)).toEqual([]);
      }
    }
  });

  it("asigna un sustituto solo a los almuerzos con carne, ave, pescado o mariscos", () => {
    const resultado = generarAlternativas({ catalogo: idx, fechas: semana, antecedentes: SIN_ANTECEDENTES, azar: conSemilla(7) });
    if (!resultado.ok) throw new Error(resultado.motivo);
    for (const dia of resultado.alternativas.flat()) {
      const conCarne = contieneCarne(idx.almuerzos.get(dia.almuerzoId)!, idx);
      expect(dia.sustitutoId !== null).toBe(conCarne);
      if (dia.sustitutoId) expect(idx.sustitutos.has(dia.sustitutoId)).toBe(true);
    }
  });

  it("respeta la semana anterior: no repite almuerzos y continúa las reglas de días seguidos", () => {
    const azar = conSemilla(99);
    let anterior: DiaPlan[] | null = null;
    for (let n = 0; n < 8; n++) {
      const antecedentes = anterior ? antecedentesDe(anterior) : SIN_ANTECEDENTES;
      const resultado = generarAlternativas({ catalogo: idx, fechas: semana, antecedentes, azar });
      expect(resultado.ok).toBe(true);
      if (!resultado.ok) return;
      for (const alternativa of resultado.alternativas)
        expect(infraccionesSemana(expandir(alternativa), antecedentes, idx)).toEqual([]);
      anterior = resultado.alternativas[0];
    }
  });

  it("genera semanas parciales con mínimos proporcionales", () => {
    for (const desde of ["2026-10-21", "2026-10-23", "2026-10-25"]) {
      const fechas = diasRestantes(desde);
      const resultado = generarAlternativas({ catalogo: idx, fechas, antecedentes: SIN_ANTECEDENTES, azar: conSemilla(3) });
      expect(resultado.ok).toBe(true);
      if (resultado.ok) expect(resultado.alternativas[0]).toHaveLength(fechas.length);
    }
  });

  it("respeta el límite semanal de cada categoría", () => {
    const conLimites = indexar({
      ...catalogoInicial,
      categorias_almuerzo: catalogoInicial.categorias_almuerzo.map((c) => ({ ...c, limite_semanal: 2 })),
    });
    const resultado = generarAlternativas({ catalogo: conLimites, fechas: semana, antecedentes: SIN_ANTECEDENTES, azar: conSemilla(5) });
    if (!resultado.ok) throw new Error(resultado.motivo);
    for (const alternativa of resultado.alternativas) {
      const conteo = new Map<string, number>();
      for (const d of alternativa) {
        const categoria = conLimites.almuerzos.get(d.almuerzoId)!.categoria;
        conteo.set(categoria, (conteo.get(categoria) ?? 0) + 1);
      }
      expect(Math.max(...conteo.values())).toBeLessThanOrEqual(2);
    }
  });

  it("informa cuando el catálogo no permite cumplir las reglas", () => {
    const sinPescados = indexar({
      ...catalogoInicial,
      almuerzos: catalogoInicial.almuerzos.filter((a) => a.categoria !== "pescados_mariscos_algas"),
    });
    const resultado = generarAlternativas({
      catalogo: sinPescados, fechas: semana, antecedentes: SIN_ANTECEDENTES, azar: conSemilla(1), intentos: 300,
    });
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) expect(resultado.motivo).toMatch(/No es posible generar minutas/);
  });
});
