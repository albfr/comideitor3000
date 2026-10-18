import { formatInTimeZone } from "date-fns-tz";

// Todas las fechas de la aplicación son strings YYYY-MM-DD en la zona horaria de Santiago (RNF-10).
export const ZONA_HORARIA = "America/Santiago";

const NOMBRES_DIA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function hoy(ahora: Date = new Date()): string {
  return formatInTimeZone(ahora, ZONA_HORARIA, "yyyy-MM-dd");
}

function aUTC(fecha: string): Date {
  return new Date(`${fecha}T00:00:00Z`);
}

export function sumarDias(fecha: string, dias: number): string {
  const d = aUTC(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** 0 = lunes … 6 = domingo. */
export function indiceDiaSemana(fecha: string): number {
  return (aUTC(fecha).getUTCDay() + 6) % 7;
}

/** Lunes de la semana que contiene la fecha (la semana empieza el lunes). */
export function inicioSemana(fecha: string): string {
  return sumarDias(fecha, -indiceDiaSemana(fecha));
}

export function diasDeSemana(lunes: string): string[] {
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
}

/** Fechas desde `desde` hasta el domingo de esa semana, inclusive. */
export function diasRestantes(desde: string): string[] {
  const fin = sumarDias(inicioSemana(desde), 6);
  const dias: string[] = [];
  for (let f = desde; f <= fin; f = sumarDias(f, 1)) dias.push(f);
  return dias;
}

export function esFinDeSemana(fecha: string): boolean {
  return indiceDiaSemana(fecha) >= 5;
}

export function nombreDia(fecha: string): string {
  return NOMBRES_DIA[aUTC(fecha).getUTCDay()];
}

export function diaDelMes(fecha: string): number {
  return aUTC(fecha).getUTCDate();
}
