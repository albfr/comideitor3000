"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, type FormEvent } from "react";
import { guardarRecetaDesdeFormulario, type EstadoFormulario } from "@/app/acciones";
import { DIFICULTADES, DIFICULTADES_ENSALADA } from "@/dominio/tipos";
import { ETIQUETA_DIFICULTAD } from "./formato";

export type Modo = "g" | "cucharada" | "al_gusto";

export interface FilaFormulario {
  ingrediente: string;
  modo: Modo;
  cantidad: string;
}

export interface ValoresReceta {
  id?: string;
  nombre: string;
  dificultad: string;
  categoria?: string;
  tiempo?: string;
  preparacion?: string;
  filas: FilaFormulario[];
}

interface Props {
  tipo: "almuerzo" | "ensalada";
  categorias: { id: string; nombre: string }[];
  ingredientes: { id: string; nombre: string; cucharada: boolean }[];
  inicial: ValoresReceta;
  volver: string;
}

export const campo = "w-full rounded-lg border border-borde bg-tarjeta px-3 py-2 text-[15px] focus:border-acento focus:outline-none";
export const etiqueta = "block space-y-1 text-sm font-medium";

export function Errores({ errores }: { errores: string[] }) {
  if (errores.length === 0) return null;
  return (
    <ul role="alert" className="space-y-1 rounded-xl border border-peligro/40 bg-peligro-suave p-3 text-sm text-peligro">
      {errores.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}

let siguienteClave = 0;
const conClave = (fila: FilaFormulario) => ({ ...fila, clave: siguienteClave++ });

export function FormularioReceta({ tipo, categorias, ingredientes, inicial, volver }: Props) {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(guardarRecetaDesdeFormulario, { errores: [] });
  // Se envía con onSubmit (y no con action) para que React no vacíe el formulario si hay errores.
  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => accion(datos));
  };
  const [filas, setFilas] = useState(() =>
    (inicial.filas.length ? inicial.filas : [{ ingrediente: "", modo: "g" as Modo, cantidad: "" }]).map(conClave),
  );
  const cambiar = (clave: number, cambio: Partial<FilaFormulario>) =>
    setFilas((actual) => actual.map((f) => (f.clave === clave ? { ...f, ...cambio } : f)));
  const dificultades = tipo === "almuerzo" ? DIFICULTADES : DIFICULTADES_ENSALADA;
  const conCucharada = new Set(ingredientes.filter((i) => i.cucharada).map((i) => i.id));

  return (
    <form onSubmit={enviar} className="space-y-5">
      <input type="hidden" name="tipo" value={tipo} />
      {inicial.id && <input type="hidden" name="id" value={inicial.id} />}

      <label className={etiqueta}>
        <span>Nombre</span>
        <input name="nombre" required defaultValue={inicial.nombre} className={campo} />
      </label>

      <div className="grid grid-cols-2 gap-3">
        {tipo === "almuerzo" && (
          <label className={etiqueta}>
            <span>Categoría</span>
            <select name="categoria" required defaultValue={inicial.categoria ?? ""} className={campo}>
              <option value="" disabled>
                Elegir…
              </option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={etiqueta}>
          <span>Dificultad</span>
          <select name="dificultad" required defaultValue={inicial.dificultad} className={campo}>
            {dificultades.map((d) => (
              <option key={d} value={d}>
                {ETIQUETA_DIFICULTAD[d]}
              </option>
            ))}
          </select>
        </label>
        {tipo === "almuerzo" && (
          <label className={etiqueta}>
            <span>Tiempo (minutos)</span>
            <input name="tiempo_minutos" type="number" min={1} required defaultValue={inicial.tiempo} className={campo} />
          </label>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Ingredientes por porción</legend>
        {filas.map((fila) => (
          <div key={fila.clave} className="grid grid-cols-[1fr_5.5rem_6.5rem_2rem] gap-1.5">
            <select
              name="ingrediente"
              value={fila.ingrediente}
              onChange={(e) => cambiar(fila.clave, { ingrediente: e.target.value })}
              className={campo}
              aria-label="Ingrediente"
            >
              <option value="">Ingrediente…</option>
              {ingredientes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre}
                </option>
              ))}
            </select>
            <input
              name="cantidad"
              inputMode="decimal"
              value={fila.modo === "al_gusto" ? "" : fila.cantidad}
              disabled={fila.modo === "al_gusto"}
              onChange={(e) => cambiar(fila.clave, { cantidad: e.target.value })}
              className={campo}
              aria-label="Cantidad"
            />
            {/* Un input deshabilitado no se envía: este mantiene alineadas las listas de cantidad. */}
            {fila.modo === "al_gusto" && <input type="hidden" name="cantidad" value="" />}
            <select
              name="modo"
              value={fila.modo}
              onChange={(e) => cambiar(fila.clave, { modo: e.target.value as Modo })}
              className={campo}
              aria-label="Unidad"
            >
              <option value="g">gramos</option>
              <option value="cucharada" disabled={!!fila.ingrediente && !conCucharada.has(fila.ingrediente)}>
                cucharadas
              </option>
              <option value="al_gusto">al gusto</option>
            </select>
            <button
              type="button"
              onClick={() => setFilas((actual) => actual.filter((f) => f.clave !== fila.clave))}
              className="rounded-lg text-lg text-suave hover:text-peligro"
              aria-label="Quitar ingrediente"
            >
              ×
            </button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setFilas((actual) => [...actual, conClave({ ingrediente: "", modo: "g", cantidad: "" })])}
            className="font-semibold text-acento"
          >
            + Agregar ingrediente
          </button>
          <Link href={`/catalogo/ingredientes/nuevo?volver=${encodeURIComponent(volver)}`} className="text-suave underline">
            ¿No está en la lista? Crear ingrediente
          </Link>
        </div>
      </fieldset>

      {tipo === "almuerzo" && (
        <label className={etiqueta}>
          <span>Preparación (un paso por línea)</span>
          <textarea name="preparacion" required rows={7} defaultValue={inicial.preparacion} className={campo} />
        </label>
      )}

      <Errores errores={estado.errores} />

      <button disabled={pendiente} className="w-full rounded-xl bg-acento px-4 py-3 font-semibold text-acento-texto disabled:opacity-60">
        {pendiente ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
