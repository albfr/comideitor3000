import { describe, expect, it } from "vitest";
import { diaDelMes, diasDeSemana, diasRestantes, esFinDeSemana, hoy, inicioSemana, nombreDia, sumarDias } from "./fechas";

describe("fechas en America/Santiago", () => {
  it("calcula hoy en la zona de Santiago y no en UTC", () => {
    // 02:00 UTC del 18 de octubre son las 23:00 del 17 en Santiago (UTC-3 en horario de verano).
    expect(hoy(new Date("2026-10-18T02:00:00Z"))).toBe("2026-10-17");
    expect(hoy(new Date("2026-10-18T04:00:00Z"))).toBe("2026-10-18");
    // En invierno Santiago está en UTC-4.
    expect(hoy(new Date("2026-07-01T03:30:00Z"))).toBe("2026-06-30");
  });

  it("la semana empieza el lunes", () => {
    expect(inicioSemana("2026-10-18")).toBe("2026-10-12"); // domingo
    expect(inicioSemana("2026-10-19")).toBe("2026-10-19"); // lunes
    expect(diasDeSemana("2026-10-19")).toEqual([
      "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25",
    ]);
  });

  it("calcula los días restantes incluyendo el día dado", () => {
    expect(diasRestantes("2026-10-16")).toEqual(["2026-10-16", "2026-10-17", "2026-10-18"]);
    expect(diasRestantes("2026-10-18")).toEqual(["2026-10-18"]);
  });

  it("cruza meses y años", () => {
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    expect(inicioSemana("2027-01-01")).toBe("2026-12-28");
  });

  it("identifica fines de semana y nombres de días", () => {
    expect(esFinDeSemana("2026-10-17")).toBe(true);
    expect(esFinDeSemana("2026-10-18")).toBe(true);
    expect(esFinDeSemana("2026-10-19")).toBe(false);
    expect(nombreDia("2026-10-21")).toBe("Miércoles");
    expect(diaDelMes("2026-10-05")).toBe(5);
  });
});
