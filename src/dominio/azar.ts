export type Aleatorio = () => number;

/** Generador pseudoaleatorio con semilla (mulberry32), para pruebas reproducibles. */
export function conSemilla(semilla: number): Aleatorio {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function barajar<T>(lista: readonly T[], azar: Aleatorio): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function elegir<T>(lista: readonly T[], azar: Aleatorio): T {
  return lista[Math.floor(azar() * lista.length)];
}
