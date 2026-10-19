"use client";

import { useState, type ReactNode } from "react";

export function PestanasAlternativas({ paneles }: { paneles: ReactNode[] }) {
  const [activa, setActiva] = useState(0);
  return (
    <div className="space-y-4">
      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-xl bg-borde/60 p-1 lg:hidden">
        {paneles.map((_, i) => (
          <button
            key={i}
            role="tab"
            id={`pestana-${i}`}
            aria-selected={activa === i}
            aria-controls={`panel-${i}`}
            onClick={() => setActiva(i)}
            className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
              activa === i ? "bg-tarjeta text-acento shadow-sm" : "text-suave"
            }`}
          >
            Alternativa {i + 1}
          </button>
        ))}
      </div>
      {/* En celular se ve una alternativa a la vez; en escritorio, las tres en columnas. */}
      <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-5">
        {paneles.map((panel, i) => (
          <div
            key={i}
            role="tabpanel"
            id={`panel-${i}`}
            aria-labelledby={`pestana-${i}`}
            className={`alternativa space-y-3 rounded-2xl lg:p-3 ${activa === i ? "" : "hidden lg:block"}`}
          >
            <h2 className="titulo-alternativa hidden text-lg font-semibold text-acento lg:block">Alternativa {i + 1}</h2>
            {panel}
          </div>
        ))}
      </div>
    </div>
  );
}
