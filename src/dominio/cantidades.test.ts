import { describe, expect, it } from "vitest";
import { aproximarUnidades, formatearGramos, gramosDeLinea, porcionesDeLinea, textoCantidad, textoLinea } from "./cantidades";
import type { Ingrediente } from "./tipos";

const tomate: Ingrediente = {
  id: "tomate",
  nombre: "tomate",
  pasillo: "frutas_y_verduras",
  unidad: { singular: "tomate mediano", plural: "tomates medianos", gramos: 100 },
};
const zapallo: Ingrediente = { id: "zapallo", nombre: "zapallo", pasillo: "frutas_y_verduras" };
const aceite: Ingrediente = { id: "aceite", nombre: "aceite", pasillo: "abarrotes_despensa", basico_despensa: true, gramos_por_cucharada: 14 };

describe("cantidades", () => {
  it("expresa gramos y kilos con coma decimal", () => {
    expect(formatearGramos(150)).toBe("150 g");
    expect(formatearGramos(1200)).toBe("1,2 kg");
    expect(formatearGramos(2000)).toBe("2 kg");
    expect(formatearGramos(999.6)).toBe("1000 g");
  });

  it("aproxima unidades a la media unidad, con mínimo 0,5", () => {
    expect(aproximarUnidades(150, 100)).toBe(1.5);
    expect(aproximarUnidades(130, 100)).toBe(1.5);
    expect(aproximarUnidades(120, 100)).toBe(1);
    expect(aproximarUnidades(5, 150)).toBe(0.5);
  });

  it("agrega la equivalencia en unidades solo si el ingrediente la tiene", () => {
    expect(textoCantidad(150, tomate)).toBe("150 g (1,5 tomates medianos)");
    expect(textoCantidad(100, tomate)).toBe("100 g (1 tomate mediano)");
    expect(textoCantidad(300, zapallo)).toBe("300 g");
  });

  it("escribe líneas de receta multiplicadas por los comensales", () => {
    expect(textoLinea({ ingrediente: "tomate", cantidad: 50, unidad: "g" }, tomate, 3)).toBe(
      "150 g de tomate (1,5 tomates medianos)",
    );
    expect(textoLinea({ ingrediente: "aceite", cantidad: 1, unidad: "cucharada" }, aceite, 3)).toBe("3 cucharadas de aceite");
    expect(textoLinea({ ingrediente: "aceite", cantidad: 1, unidad: "cucharada" }, aceite, 1)).toBe("1 cucharada de aceite");
    expect(textoLinea({ ingrediente: "tomate", opcional: true }, tomate, 3)).toBe("tomate (al gusto)");
  });

  it("convierte cucharadas a gramos", () => {
    expect(gramosDeLinea({ ingrediente: "aceite", cantidad: 2, unidad: "cucharada" }, aceite)).toBe(28);
    expect(() => gramosDeLinea({ ingrediente: "zapallo", cantidad: 1, unidad: "cucharada" }, zapallo)).toThrow();
  });

  it("da las porciones de carne solo a los no vegetarianos", () => {
    const pollo: Ingrediente = { id: "pollo", nombre: "pollo", pasillo: "carnes_y_aves", grupo: "carne" };
    const salmon: Ingrediente = { id: "salmon", nombre: "salmón", pasillo: "pescados_y_mariscos", grupo: "pescado_marisco" };
    expect(porcionesDeLinea(pollo, 3, 1)).toBe(2);
    expect(porcionesDeLinea(salmon, 3, 1)).toBe(2);
    expect(porcionesDeLinea(pollo, 2, 5)).toBe(0);
    expect(porcionesDeLinea(tomate, 3, 1)).toBe(3);
  });
});
