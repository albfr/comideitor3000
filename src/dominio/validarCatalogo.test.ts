import { describe, expect, it } from "vitest";
import { catalogoInicial, pasillosValidos } from "./catalogoDePrueba";
import type { Catalogo } from "./tipos";
import { validarCatalogo } from "./validarCatalogo";

describe("validación del catálogo", () => {
  it("el catálogo inicial es válido", () => {
    expect(validarCatalogo(catalogoInicial, pasillosValidos)).toEqual([]);
  });

  it("detecta referencias y unidades inválidas", () => {
    const roto: Catalogo = structuredClone(catalogoInicial);
    roto.ingredientes[0].pasillo = "pasillo_inexistente";
    roto.almuerzos[0].ingredientes.push({ ingrediente: "no_existe", cantidad: 10, unidad: "g" });
    roto.almuerzos[1].ingredientes.push({ ingrediente: "zapallo_italiano", cantidad: 1, unidad: "cucharada" });
    roto.ensaladas[0].dificultad = "alta" as never;
    const errores = validarCatalogo(roto, pasillosValidos).join("\n");
    expect(errores).toMatch(/pasillo desconocido/);
    expect(errores).toMatch(/ingrediente desconocido "no_existe"/);
    expect(errores).toMatch(/no tiene equivalencia en gramos por cucharada/);
    expect(errores).toMatch(/ensalada_chilena: dificultad inválida/);
  });
});
