"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useState, useTransition } from "react";
import { cambiarComensalesDia, reordenarDias } from "@/app/acciones";

export interface ContenidoDia {
  almuerzo: string;
  ensalada: string;
  categoria: string;
}

export interface DiaSemana {
  fecha: string;
  etiqueta: string;
  esHoy: boolean;
  pasado: boolean;
  comensales: number | null;
  contenido: ContenidoDia | null;
}

const ALTO_FILA = "h-[5.5rem]";

function Tarjeta({ contenido, fecha, arrastre }: { contenido: ContenidoDia; fecha: string; arrastre?: React.ReactNode }) {
  return (
    <div className={`flex ${ALTO_FILA} items-center gap-2 rounded-xl border border-borde bg-tarjeta pl-3`}>
      <Link href={`/dia/${fecha}`} className="min-w-0 flex-1 py-2">
        <span className="block truncate font-medium">{contenido.almuerzo}</span>
        <span className="block truncate text-sm text-suave">{contenido.ensalada}</span>
        <span className="block truncate text-xs text-suave">{contenido.categoria}</span>
      </Link>
      {arrastre}
    </div>
  );
}

function TarjetaOrdenable({ id, contenido, fecha }: { id: string; contenido: ContenidoDia; fecha: string }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-90 shadow-xl" : undefined}
    >
      <Tarjeta
        contenido={contenido}
        fecha={fecha}
        arrastre={
          <button
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            aria-label={`Mover ${contenido.almuerzo}`}
            className="flex h-full w-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-r-xl text-xl text-suave hover:bg-acento-suave active:cursor-grabbing"
          >
            ⠿
          </button>
        }
      />
    </div>
  );
}

function Comensales({ fecha, cantidad, editable }: { fecha: string; cantidad: number; editable: boolean }) {
  const boton =
    "flex h-7 w-7 items-center justify-center rounded-full border border-borde bg-tarjeta text-base font-semibold disabled:opacity-40";
  return (
    <form action={cambiarComensalesDia} className="flex items-center gap-1.5" aria-label="Comensales">
      <input type="hidden" name="fecha" value={fecha} />
      <button name="delta" value="-1" disabled={!editable || cantidad <= 1} className={boton} aria-label="Quitar un comensal">
        −
      </button>
      <span className="w-5 text-center text-sm font-semibold tabular-nums" title="Comensales">
        {cantidad}
      </span>
      <button name="delta" value="1" disabled={!editable} className={boton} aria-label="Agregar un comensal">
        +
      </button>
    </form>
  );
}

/** Una semana de la vista bisemanal: días fijos a la izquierda, platos que se arrastran a la derecha (RF-20, RF-21). */
export function SemanaEditable({ inicio, dias }: { inicio: string; dias: DiaSemana[] }) {
  const editables = dias.filter((d) => !d.pasado && d.contenido);
  const contenidoPorId = new Map(editables.map((d) => [d.fecha, d.contenido!]));
  const [orden, setOrden] = useState(editables.map((d) => d.fecha));
  const [, iniciarTransicion] = useTransition();
  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function alSoltar({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const nuevo = arrayMove(orden, orden.indexOf(String(active.id)), orden.indexOf(String(over.id)));
    setOrden(nuevo);
    iniciarTransicion(() => reordenarDias(inicio, nuevo));
  }

  let posicion = 0;
  return (
    <DndContext id={`semana-${inicio}`} sensors={sensores} collisionDetection={closestCenter} onDragEnd={alSoltar}>
      <SortableContext items={orden} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2">
          {dias.map((dia) => {
            const ordenable = !dia.pasado && dia.contenido;
            const id = ordenable ? orden[posicion++] : null;
            return (
              <li key={dia.fecha} className={`grid grid-cols-[6.5rem_1fr] gap-2 ${dia.pasado ? "opacity-55" : ""}`}>
                <div className={`flex ${ALTO_FILA} flex-col justify-center gap-1.5`}>
                  <span className={`text-sm font-semibold ${dia.esHoy ? "text-acento" : ""}`}>
                    {dia.etiqueta}
                    {dia.esHoy && <span className="block text-xs font-medium">Hoy</span>}
                  </span>
                  {dia.comensales != null && <Comensales fecha={dia.fecha} cantidad={dia.comensales} editable={!dia.pasado} />}
                </div>
                {id ? (
                  <TarjetaOrdenable id={id} contenido={contenidoPorId.get(id)!} fecha={dia.fecha} />
                ) : dia.contenido ? (
                  <Tarjeta contenido={dia.contenido} fecha={dia.fecha} />
                ) : (
                  <div className={`flex ${ALTO_FILA} items-center rounded-xl border border-dashed border-borde px-3 text-sm text-suave`}>
                    Sin minuta
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </SortableContext>
    </DndContext>
  );
}
