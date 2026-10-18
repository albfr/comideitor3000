"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { crearIngredienteDesdeFormulario, type EstadoFormulario } from "@/app/acciones";
import { GRUPOS } from "@/dominio/tipos";
import { ETIQUETA_GRUPO } from "./formato";
import { campo, Errores, etiqueta } from "./FormularioReceta";

export function FormularioIngrediente({ pasillos, volver }: { pasillos: { id: string; nombre: string }[]; volver: string }) {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(crearIngredienteDesdeFormulario, { errores: [] });
  // Se envía con onSubmit (y no con action) para que React no vacíe el formulario si hay errores.
  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => accion(datos));
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      <input type="hidden" name="volver" value={volver} />
      <label className={etiqueta}>
        <span>Nombre</span>
        <input name="nombre" required className={campo} placeholder="por ejemplo: zapallo italiano" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className={etiqueta}>
          <span>Pasillo del supermercado</span>
          <select name="pasillo" required defaultValue="" className={campo}>
            <option value="" disabled>
              Elegir…
            </option>
            {pasillos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className={etiqueta}>
          <span>Grupo (para las reglas)</span>
          <select name="grupo" defaultValue="" className={campo}>
            <option value="">Ninguno</option>
            {GRUPOS.map((g) => (
              <option key={g} value={g}>
                {ETIQUETA_GRUPO[g]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="basico_despensa" className="h-4 w-4 accent-[var(--acento)]" />
        Básico de despensa (sal, aceite, especias): no va a la lista de compras
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Unidad de compra (opcional)</legend>
        <p className="text-xs text-suave">Permite mostrar &quot;150 g de tomate (1,5 tomates medianos)&quot;.</p>
        <div className="grid grid-cols-3 gap-2">
          <input name="unidad_singular" placeholder="tomate mediano" className={campo} aria-label="Unidad en singular" />
          <input name="unidad_plural" placeholder="tomates medianos" className={campo} aria-label="Unidad en plural" />
          <input name="unidad_gramos" inputMode="decimal" placeholder="gramos" className={campo} aria-label="Gramos por unidad" />
        </div>
      </fieldset>
      <label className={etiqueta}>
        <span>Gramos por cucharada (opcional, para usarlo en cucharadas)</span>
        <input name="gramos_por_cucharada" inputMode="decimal" className={campo} />
      </label>

      <Errores errores={estado.errores} />
      <button disabled={pendiente} className="w-full rounded-xl bg-acento px-4 py-3 font-semibold text-acento-texto disabled:opacity-60">
        {pendiente ? "Guardando…" : "Crear ingrediente"}
      </button>
    </form>
  );
}
