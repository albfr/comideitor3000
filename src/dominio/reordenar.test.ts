import { describe, expect, it } from "vitest";
import { moverElemento, reasignarContenidos } from "./reordenar";
import type { DiaPlan } from "./tipos";

const dia = (fecha: string, almuerzoId: string): DiaPlan => ({ fecha, almuerzoId, ensaladaId: `e-${almuerzoId}`, sustitutoId: null });

describe("reordenar", () => {
  it("mueve un elemento desplazando los intermedios", () => {
    expect(moverElemento(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moverElemento(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"]);
  });

  it("reasigna almuerzo y ensalada juntos, manteniendo las fechas", () => {
    const dias = [dia("2026-10-21", "A"), dia("2026-10-22", "B"), dia("2026-10-23", "C")];
    const resultado = reasignarContenidos(dias, ["2026-10-23", "2026-10-21", "2026-10-22"]);
    expect(resultado.map((d) => [d.fecha, d.almuerzoId, d.ensaladaId])).toEqual([
      ["2026-10-21", "C", "e-C"],
      ["2026-10-22", "A", "e-A"],
      ["2026-10-23", "B", "e-B"],
    ]);
  });

  it("rechaza órdenes que no son permutaciones", () => {
    const dias = [dia("2026-10-21", "A"), dia("2026-10-22", "B")];
    expect(() => reasignarContenidos(dias, ["2026-10-21", "2026-10-21"])).toThrow();
    expect(() => reasignarContenidos(dias, ["2026-10-21"])).toThrow();
    expect(() => reasignarContenidos(dias, ["2026-10-21", "2026-10-20"])).toThrow();
  });
});
