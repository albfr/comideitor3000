"use client";

import { useRef, type ReactNode } from "react";

/**
 * Botón que abre su contenido en una ventana flotante (un <dialog> modal: oscurece y difumina el
 * fondo, se cierra con Esc, con la ×, o al hacer clic fuera de la ventana).
 */
export function VentanaFlotante({
  disparador,
  titulo,
  children,
  className = "",
}: {
  disparador: ReactNode;
  titulo: string;
  children: ReactNode;
  className?: string;
}) {
  const ventana = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" onClick={() => ventana.current?.showModal()} className={className}>
        {disparador}
      </button>
      <dialog
        ref={ventana}
        aria-label={titulo}
        // El clic cae en el propio <dialog> solo cuando es sobre el fondo, fuera del contenido.
        onClick={(evento) => evento.target === ventana.current && ventana.current.close()}
        className="ventana-flotante m-auto max-h-[88vh] w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-2xl border border-borde bg-fondo p-0 text-texto shadow-2xl"
      >
        <div className="max-h-[88vh] overflow-y-auto p-5 sm:p-7">
          <form method="dialog" className="sticky top-0 z-10 float-right -mr-2 -mt-2">
            <button
              aria-label="Cerrar"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-borde bg-tarjeta text-xl text-suave shadow-sm hover:text-texto"
            >
              ×
            </button>
          </form>
          {children}
        </div>
      </dialog>
    </>
  );
}
