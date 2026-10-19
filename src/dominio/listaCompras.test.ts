import { describe, expect, it } from "vitest";
import { calcularListaCompras } from "./listaCompras";
import { indexar, type Almuerzo, type Catalogo, type Ensalada } from "./tipos";

const catalogo: Catalogo = {
  categorias_almuerzo: [{ id: "legumbres", nombre: "Legumbres", limite_semanal: null }],
  ingredientes: [
    { id: "lentejas", nombre: "lentejas", pasillo: "abarrotes_despensa", grupo: "legumbre" },
    { id: "tomate", nombre: "tomate", pasillo: "frutas_y_verduras", unidad: { singular: "tomate mediano", plural: "tomates medianos", gramos: 100 } },
    { id: "cilantro", nombre: "cilantro", pasillo: "frutas_y_verduras" },
    { id: "mantequilla", nombre: "mantequilla", pasillo: "lacteos_y_huevos", gramos_por_cucharada: 14 },
    { id: "sal", nombre: "sal", pasillo: "abarrotes_despensa", basico_despensa: true },
    { id: "aceite", nombre: "aceite", pasillo: "abarrotes_despensa", basico_despensa: true, gramos_por_cucharada: 14 },
    { id: "carne_molida", nombre: "carne molida", pasillo: "carnes_y_aves", grupo: "carne" },
    { id: "tofu", nombre: "tofu", pasillo: "dieteticos_y_especiales", grupo: "sustituto_carne" },
  ],
  sustitutos_carne: [{ ingrediente: "tofu", gramos_por_porcion: 120 }],
  almuerzos: [],
  ensaladas: [],
};
const idx = indexar(catalogo);

const almuerzo = (id: string, ingredientes: Almuerzo["ingredientes"]): Almuerzo => ({
  id, nombre: id, categoria: "legumbres", dificultad: "baja", tiempo_minutos: 30, imagen: null, ingredientes, preparacion: ["x"],
});
const ensalada = (id: string, ingredientes: Ensalada["ingredientes"]): Ensalada => ({ id, nombre: id, dificultad: "baja", ingredientes });

const guiso = almuerzo("guiso", [
  { ingrediente: "lentejas", cantidad: 80, unidad: "g" },
  { ingrediente: "tomate", cantidad: 50, unidad: "g" },
  { ingrediente: "mantequilla", cantidad: 1, unidad: "cucharada" },
  { ingrediente: "sal", opcional: true },
  { ingrediente: "aceite", cantidad: 1, unidad: "cucharada" },
]);
const pino = almuerzo("pino", [{ ingrediente: "carne_molida", cantidad: 100, unidad: "g" }]);
const chilena = ensalada("chilena", [
  { ingrediente: "tomate", cantidad: 100, unidad: "g" },
  { ingrediente: "cilantro", opcional: true },
]);

function item(secciones: ReturnType<typeof calcularListaCompras>, id: string) {
  return secciones.flatMap((s) => s.items).find((i) => i.ingrediente.id === id);
}

describe("lista de compras", () => {
  it("suma un ingrediente entre recetas y días, escalado por comensales", () => {
    const lista = calcularListaCompras(
      [
        { comensales: 3, almuerzo: guiso, ensalada: chilena, vegetarianos: 0, sustitutoId: null },
        { comensales: 2, almuerzo: pino, ensalada: chilena, vegetarianos: 0, sustitutoId: null },
      ],
      idx,
    );
    // tomate: (50 + 100) × 3 + 100 × 2 = 650 g
    expect(item(lista, "tomate")?.gramos).toBe(650);
    expect(item(lista, "tomate")?.texto).toBe("650 g (6,5 tomates medianos)");
    expect(item(lista, "lentejas")?.texto).toBe("240 g");
    expect(item(lista, "carne_molida")?.gramos).toBe(200);
  });

  it("convierte cucharadas a gramos", () => {
    const lista = calcularListaCompras([{ comensales: 3, almuerzo: guiso, ensalada: chilena, vegetarianos: 0, sustitutoId: null }], idx);
    expect(item(lista, "mantequilla")?.gramos).toBe(42);
  });

  it("excluye los básicos de despensa aunque tengan cantidad", () => {
    const lista = calcularListaCompras([{ comensales: 3, almuerzo: guiso, ensalada: chilena, vegetarianos: 0, sustitutoId: null }], idx);
    expect(item(lista, "sal")).toBeUndefined();
    expect(item(lista, "aceite")).toBeUndefined();
  });

  it("muestra los opcionales sin cantidad", () => {
    const lista = calcularListaCompras([{ comensales: 3, almuerzo: guiso, ensalada: chilena, vegetarianos: 0, sustitutoId: null }], idx);
    expect(item(lista, "cilantro")).toMatchObject({ soloOpcional: true, texto: "al gusto" });
  });

  it("calcula la carne para los no vegetarianos y el sustituto para los vegetarianos", () => {
    const lista = calcularListaCompras([{ comensales: 4, vegetarianos: 1, almuerzo: pino, ensalada: chilena, sustitutoId: "tofu" }], idx);
    expect(item(lista, "carne_molida")?.gramos).toBe(100 * 3);
    expect(item(lista, "tofu")?.gramos).toBe(120 * 1);
    // Los ingredientes sin carne siguen siendo para todos.
    expect(item(lista, "tomate")?.gramos).toBe(100 * 4);
  });

  it("no compra carne si todos son vegetarianos, ni sustituto si no hay vegetarianos", () => {
    const todos = calcularListaCompras([{ comensales: 2, vegetarianos: 2, almuerzo: pino, ensalada: chilena, sustitutoId: "tofu" }], idx);
    expect(item(todos, "carne_molida")).toBeUndefined();
    expect(item(todos, "tofu")?.gramos).toBe(240);
    const ninguno = calcularListaCompras([{ comensales: 2, vegetarianos: 0, almuerzo: pino, ensalada: chilena, sustitutoId: "tofu" }], idx);
    expect(item(ninguno, "tofu")).toBeUndefined();
    expect(item(ninguno, "carne_molida")?.gramos).toBe(200);
  });

  it("no aplica el sustituto a almuerzos sin carne", () => {
    const lista = calcularListaCompras([{ comensales: 3, vegetarianos: 1, almuerzo: guiso, ensalada: chilena, sustitutoId: null }], idx);
    expect(item(lista, "lentejas")?.gramos).toBe(240);
    expect(item(lista, "tofu")).toBeUndefined();
  });

  it("agrupa por pasillo en el orden indicado", () => {
    const lista = calcularListaCompras(
      [{ comensales: 1, almuerzo: guiso, ensalada: chilena, vegetarianos: 0, sustitutoId: null }],
      idx,
      ["frutas_y_verduras", "lacteos_y_huevos", "abarrotes_despensa"],
    );
    expect(lista.map((s) => s.pasillo)).toEqual(["frutas_y_verduras", "lacteos_y_huevos", "abarrotes_despensa"]);
    expect(lista[0].items.map((i) => i.ingrediente.id)).toEqual(["cilantro", "tomate"]);
  });

  it("devuelve una lista vacía si no hay días", () => {
    expect(calcularListaCompras([], idx)).toEqual([]);
  });
});
