import { diaDelMes, nombreDia } from "@/dominio/fechas";
import type { Dificultad } from "@/dominio/tipos";

export const ETIQUETA_DIFICULTAD: Record<Dificultad, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  muy_alta: "Muy alta",
};

export const ETIQUETA_GRUPO: Record<string, string> = {
  legumbre: "Legumbre",
  carne: "Carne o ave",
  pescado_marisco: "Pescado o marisco",
  alga: "Alga",
  sustituto_carne: "Sustituto de carne",
};

/** "Miércoles 21" */
export function textoFecha(fecha: string): string {
  return `${nombreDia(fecha)} ${diaDelMes(fecha)}`;
}

export function textoMinutos(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}
