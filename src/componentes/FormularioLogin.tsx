"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoFormulario } from "@/app/acciones";
import { campo, Errores } from "./FormularioReceta";

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState<EstadoFormulario, FormData>(iniciarSesion, { errores: [] });
  return (
    <form action={accion} className="space-y-4">
      <label className="block space-y-1 text-sm font-medium">
        <span>Contraseña</span>
        <input name="contrasena" type="password" required autoFocus autoComplete="current-password" className={campo} />
      </label>
      <Errores errores={estado.errores} />
      <button disabled={pendiente} className="w-full rounded-xl bg-acento px-4 py-3 font-semibold text-acento-texto disabled:opacity-60">
        Entrar
      </button>
    </form>
  );
}
