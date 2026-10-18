import { describe, expect, it } from "vitest";
import { catalogoInicial } from "./catalogoDePrueba";
import { infraccionesSemana, minimoProporcional, sonCompatibles, SIN_ANTECEDENTES } from "./reglas";
import { indexar } from "./tipos";

const idx = indexar(catalogoInicial);
const a = (id: string) => idx.almuerzos.get(id)!;
const e = (id: string) => idx.ensaladas.get(id)!;

// Semana válida de referencia (2 legumbres en almuerzo, 2 pescados, sin categorías seguidas).
const valida = [
  { almuerzo: a("lentejas_guisadas"), ensalada: e("ensalada_betarraga") },
  { almuerzo: a("reineta_pure"), ensalada: e("ensalada_repollo") },
  { almuerzo: a("carbonada"), ensalada: e("ensalada_lechuga") },
  { almuerzo: a("garbanzos_espinaca"), ensalada: e("ensalada_quinoa") },
  { almuerzo: a("salmon_horno"), ensalada: e("ensalada_betarraga") },
  { almuerzo: a("tortilla_papas"), ensalada: e("ensalada_rucula_pera") },
  { almuerzo: a("pollo_jugo"), ensalada: e("ensalada_pepino_yogur") },
];

describe("reglas de la minuta", () => {
  it("calcula mínimos proporcionales redondeando hacia abajo", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(minimoProporcional)).toEqual([0, 0, 0, 1, 1, 1, 2]);
  });

  it("acepta una semana que cumple todo", () => {
    expect(infraccionesSemana(valida, SIN_ANTECEDENTES, idx)).toEqual([]);
  });

  it("ignora los básicos de despensa al comparar almuerzo y ensalada", () => {
    // Ambas usan aceite y sal, pero no comparten otros ingredientes.
    expect(sonCompatibles(a("lentejas_guisadas"), e("ensalada_betarraga"), idx)).toBe(true);
    // Comparten cebolla.
    expect(sonCompatibles(a("lentejas_guisadas"), e("ensalada_chilena"), idx)).toBe(false);
  });

  it("detecta ingredientes repetidos entre almuerzo y ensalada del mismo día", () => {
    const semana = valida.map((d, i) => (i === 0 ? { ...d, ensalada: e("ensalada_chilena") } : d));
    expect(infraccionesSemana(semana, SIN_ANTECEDENTES, idx).join()).toMatch(/Ingredientes repetidos/);
  });

  it("detecta la misma categoría dos días seguidos, también desde la semana anterior", () => {
    const antecedentes = { almuerzosExcluidos: [], ultimosDias: [{ categoria: "legumbres", ensaladaId: "ensalada_lechuga" }] };
    expect(infraccionesSemana(valida, antecedentes, idx).join()).toMatch(/Categoría legumbres dos días seguidos/);
  });

  it("detecta una ensalada más de dos días seguidos", () => {
    const semana = valida.map((d, i) => (i >= 4 ? { ...d, ensalada: e("ensalada_repollo") } : d));
    expect(infraccionesSemana(semana, SIN_ANTECEDENTES, idx).join()).toMatch(/más de dos días seguidos/);
  });

  it("detecta almuerzos de la semana anterior y repetidos", () => {
    const antecedentes = { almuerzosExcluidos: ["carbonada"], ultimosDias: [] };
    expect(infraccionesSemana(valida, antecedentes, idx).join()).toMatch(/semana anterior: Carbonada/);
    const repetido = valida.map((d, i) => (i === 6 ? { ...d, almuerzo: a("carbonada") } : d));
    expect(infraccionesSemana(repetido, SIN_ANTECEDENTES, idx).join()).toMatch(/Almuerzo repetido/);
  });

  it("exige legumbres y pescados, con al menos un almuerzo de legumbres", () => {
    const sinPescado = valida.map((d, i) => (i === 1 ? { ...d, almuerzo: a("budin_zapallo_italiano") } : d));
    expect(infraccionesSemana(sinPescado, SIN_ANTECEDENTES, idx).join()).toMatch(/pescados, mariscos o algas/);
    // Las legumbres en ensaladas cuentan, pero no bastan sin un almuerzo de legumbres.
    const soloEnsaladas = valida.map((d, i) =>
      i === 0 ? { almuerzo: a("budin_zapallo_italiano"), ensalada: e("ensalada_lentejas") }
        : i === 3 ? { almuerzo: a("risotto_champinones"), ensalada: e("ensalada_garbanzos") } : d,
    );
    expect(infraccionesSemana(soloEnsaladas, SIN_ANTECEDENTES, idx)).toContain("Ningún almuerzo con legumbres");
  });
});
