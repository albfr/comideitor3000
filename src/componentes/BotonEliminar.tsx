"use client";

export function BotonEliminar({
  id,
  nombre,
  accion,
}: {
  id: string;
  nombre: string;
  accion: (formData: FormData) => Promise<void>;
}) {
  return (
    <form
      action={accion}
      onSubmit={(evento) => {
        if (!confirm(`¿Eliminar "${nombre}" del catálogo? Las minutas que ya lo usan lo seguirán mostrando.`))
          evento.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="rounded-lg border border-peligro/50 px-4 py-2 text-sm font-semibold text-peligro hover:bg-peligro-suave">
        Eliminar
      </button>
    </form>
  );
}
