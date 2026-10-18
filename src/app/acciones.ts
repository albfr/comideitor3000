"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hoy } from "@/dominio/fechas";
import { DIFICULTADES, DIFICULTADES_ENSALADA, GRUPOS, type Grupo, type Ingrediente, type LineaIngrediente } from "@/dominio/tipos";
import { validarLineas } from "@/dominio/validarCatalogo";
import { cargarCatalogo, crearId, eliminarReceta, guardarIngrediente, guardarReceta, idsDeRecetas } from "@/servidor/catalogo";
import { cambiarComensales, reordenarSemana, seleccionarPropuesta } from "@/servidor/minutas";
import { IDS_PASILLOS } from "@/servidor/pasillos";
import { COOKIE_SESION, contrasenaCorrecta, DURACION_SESION_SEGUNDOS, sesionValida, tokenDeSesion } from "@/servidor/sesion";

export interface EstadoFormulario {
  errores: string[];
}

// Cada acción verifica la sesión: son alcanzables por POST aunque el proxy las cubra.
async function exigirSesion() {
  if (!sesionValida((await cookies()).get(COOKIE_SESION)?.value)) throw new Error("No autorizado");
}

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

function numero(valor: string): number {
  return Number(valor.replace(",", "."));
}

// --- Sesión ---

export async function iniciarSesion(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  if (!process.env.APP_PASSWORD) return { errores: ["Falta configurar la variable de entorno APP_PASSWORD."] };
  if (!contrasenaCorrecta(texto(formData, "contrasena"))) return { errores: ["Contraseña incorrecta."] };
  (await cookies()).set(COOKIE_SESION, tokenDeSesion(process.env.APP_PASSWORD), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: DURACION_SESION_SEGUNDOS,
    path: "/",
  });
  redirect("/");
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
  redirect("/login");
}

// --- Minuta ---

export async function elegirMinuta(formData: FormData) {
  await exigirSesion();
  await seleccionarPropuesta(texto(formData, "inicio"), Number(texto(formData, "indice")), hoy());
  redirect("/semana");
}

export async function reordenarDias(inicio: string, nuevoOrden: string[]) {
  await exigirSesion();
  await reordenarSemana(inicio, nuevoOrden, hoy());
  refresh();
}

export async function cambiarComensalesDia(formData: FormData) {
  await exigirSesion();
  await cambiarComensales(texto(formData, "fecha"), Number(texto(formData, "delta")), hoy());
  refresh();
}

// --- Catálogo ---

export async function guardarRecetaDesdeFormulario(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirSesion();
  const tipo = texto(formData, "tipo") === "ensalada" ? "ensalada" : "almuerzo";
  const idExistente = texto(formData, "id");
  const nombre = texto(formData, "nombre");
  const dificultad = texto(formData, "dificultad");
  const errores: string[] = [];
  if (!nombre) errores.push("El nombre es obligatorio.");

  const idx = await cargarCatalogo();
  const ingredientesForm = formData.getAll("ingrediente").map(String);
  const modos = formData.getAll("modo").map(String);
  const cantidades = formData.getAll("cantidad").map(String);
  const lineas: LineaIngrediente[] = [];
  ingredientesForm.forEach((ingrediente, i) => {
    if (!ingrediente) return;
    if (modos[i] === "al_gusto") lineas.push({ ingrediente, opcional: true });
    else lineas.push({ ingrediente, cantidad: numero(cantidades[i] ?? ""), unidad: modos[i] === "cucharada" ? "cucharada" : "g" });
  });
  errores.push(...validarLineas(nombre || "La receta", lineas, idx.ingredientes));

  const recetaActual = idExistente ? (idx.almuerzos.get(idExistente) ?? idx.ensaladas.get(idExistente)) : undefined;
  if (idExistente && !recetaActual) errores.push("La receta que intentas editar no existe.");
  // "nuevo" e "ingredientes" son rutas de /catalogo y no pueden ser ids de recetas.
  const id = idExistente || crearId(nombre, new Set([...(await idsDeRecetas()), "nuevo", "ingredientes"]));

  if (tipo === "almuerzo") {
    const categoria = texto(formData, "categoria");
    const tiempo = Number(texto(formData, "tiempo_minutos"));
    const preparacion = texto(formData, "preparacion").split("\n").map((p) => p.trim()).filter(Boolean);
    if (!idx.categorias.has(categoria)) errores.push("Elige una categoría.");
    if (!DIFICULTADES.includes(dificultad as never)) errores.push("Elige una dificultad.");
    if (!(Number.isInteger(tiempo) && tiempo > 0)) errores.push("El tiempo de preparación debe ser un número de minutos mayor que 0.");
    if (preparacion.length === 0) errores.push("Escribe al menos un paso de preparación.");
    if (errores.length) return { errores };
    await guardarReceta({
      tipo,
      datos: {
        id, nombre, categoria, tiempo_minutos: tiempo, preparacion, ingredientes: lineas,
        dificultad: dificultad as (typeof DIFICULTADES)[number],
        imagen: null,
      },
    });
  } else {
    if (!DIFICULTADES_ENSALADA.includes(dificultad as never)) errores.push("La dificultad de una ensalada debe ser baja o media.");
    if (errores.length) return { errores };
    await guardarReceta({
      tipo,
      datos: { id, nombre, ingredientes: lineas, dificultad: dificultad as (typeof DIFICULTADES_ENSALADA)[number] },
    });
  }
  redirect(`/catalogo/${id}`);
}

export async function eliminarRecetaDesdeFormulario(formData: FormData) {
  await exigirSesion();
  await eliminarReceta(texto(formData, "id"));
  redirect("/catalogo");
}

export async function crearIngredienteDesdeFormulario(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirSesion();
  const nombre = texto(formData, "nombre").toLowerCase();
  const pasillo = texto(formData, "pasillo");
  const grupo = texto(formData, "grupo");
  const singular = texto(formData, "unidad_singular");
  const plural = texto(formData, "unidad_plural");
  const gramosUnidad = texto(formData, "unidad_gramos");
  const gramosCucharada = texto(formData, "gramos_por_cucharada");
  const errores: string[] = [];

  const idx = await cargarCatalogo();
  if (!nombre) errores.push("El nombre es obligatorio.");
  if ([...idx.ingredientes.values()].some((i) => i.nombre.toLowerCase() === nombre))
    errores.push(`Ya existe un ingrediente llamado "${nombre}".`);
  if (!IDS_PASILLOS.has(pasillo)) errores.push("Elige un pasillo del supermercado.");
  if (grupo && !GRUPOS.includes(grupo as Grupo)) errores.push("Grupo inválido.");
  const conUnidad = singular || plural || gramosUnidad;
  if (conUnidad && !(singular && plural && numero(gramosUnidad) > 0))
    errores.push("Para la unidad de compra completa el singular, el plural y los gramos por unidad.");
  if (gramosCucharada && !(numero(gramosCucharada) > 0)) errores.push("Los gramos por cucharada deben ser mayores que 0.");
  if (errores.length) return { errores };

  const ingrediente: Ingrediente = {
    id: crearId(nombre, new Set(idx.ingredientes.keys())),
    nombre,
    pasillo,
    grupo: (grupo as Grupo) || null,
    basico_despensa: formData.get("basico_despensa") === "on",
    unidad: conUnidad ? { singular, plural, gramos: numero(gramosUnidad) } : null,
    gramos_por_cucharada: gramosCucharada ? numero(gramosCucharada) : null,
  };
  await guardarIngrediente(ingrediente);
  const volver = texto(formData, "volver");
  redirect(volver.startsWith("/catalogo") ? volver : "/catalogo");
}
