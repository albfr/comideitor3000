// Carga data/catalogo.json en la base de datos. Es idempotente: actualiza lo que ya existe.
// Las imágenes locales se suben a Vercel Blob si BLOB_READ_WRITE_TOKEN está definido.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import type { Catalogo } from "../src/dominio/tipos";
import { validarCatalogo } from "../src/dominio/validarCatalogo";
import { guardarIngrediente, guardarReceta } from "../src/servidor/catalogo";
import { db } from "../src/servidor/db";
import { categorias, sustitutosCarne } from "../src/servidor/esquema";
import { IDS_PASILLOS } from "../src/servidor/pasillos";

const RUTA_CATALOGO = path.join(process.cwd(), "data", "catalogo.json");

async function urlDeImagen(id: string, imagen: string | null): Promise<string | undefined> {
  if (!imagen) return undefined;
  if (/^https?:\/\//.test(imagen)) return imagen;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn(`  Sin BLOB_READ_WRITE_TOKEN: se omite la imagen de ${id} (${imagen}).`);
    return undefined;
  }
  const archivo = path.resolve(path.dirname(RUTA_CATALOGO), imagen);
  const subida = await put(`platos/${id}${path.extname(archivo)}`, await readFile(archivo), {
    access: "public",
    allowOverwrite: true,
  });
  return subida.url;
}

async function main() {
  const catalogo = JSON.parse(await readFile(RUTA_CATALOGO, "utf-8")) as Catalogo;
  const errores = validarCatalogo(catalogo, IDS_PASILLOS);
  if (errores.length) {
    console.error("El catálogo tiene errores:\n  " + errores.join("\n  "));
    process.exit(1);
  }

  for (const [orden, c] of catalogo.categorias_almuerzo.entries()) {
    const valores = { id: c.id, nombre: c.nombre, limiteSemanal: c.limite_semanal, orden };
    await db.insert(categorias).values(valores).onConflictDoUpdate({ target: categorias.id, set: valores });
  }
  for (const ingrediente of catalogo.ingredientes) await guardarIngrediente(ingrediente);
  for (const s of catalogo.sustitutos_carne) {
    const valores = { ingredienteId: s.ingrediente, gramosPorPorcion: s.gramos_por_porcion };
    await db.insert(sustitutosCarne).values(valores).onConflictDoUpdate({ target: sustitutosCarne.ingredienteId, set: valores });
  }
  for (const almuerzo of catalogo.almuerzos)
    await guardarReceta({ tipo: "almuerzo", datos: almuerzo, imagenUrl: await urlDeImagen(almuerzo.id, almuerzo.imagen) });
  for (const ensalada of catalogo.ensaladas) await guardarReceta({ tipo: "ensalada", datos: ensalada });

  console.log(
    `Catálogo cargado: ${catalogo.almuerzos.length} almuerzos, ${catalogo.ensaladas.length} ensaladas, ` +
      `${catalogo.ingredientes.length} ingredientes.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
