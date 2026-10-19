import Link from "next/link";
import { connection } from "next/server";
import { diasDeSemana, diasRestantes, hoy, inicioSemana, sumarDias } from "@/dominio/fechas";
import { calcularListaCompras, type DiaConsumo } from "@/dominio/listaCompras";
import { cargarCatalogo } from "@/servidor/catalogo";
import { obtenerDias, obtenerSemana, tieneMinuta } from "@/servidor/minutas";
import { nombrePasillo, ORDEN_PASILLOS } from "@/servidor/pasillos";
import { Suspense } from "react";
import Cargando from "@/app/loading";
import { exigirUsuario } from "@/servidor/usuario";

const RANGOS = [
  { id: "hoy", texto: "Hoy" },
  { id: "manana", texto: "Mañana" },
  { id: "semana", texto: "Resto de la semana" },
  { id: "proxima", texto: "Próxima semana" },
] as const;
type Rango = (typeof RANGOS)[number]["id"];

/** Lista de ingredientes por rango de días, agrupada por pasillo (RF-13 a RF-16). */
async function ContenidoVistaIngredientes({ searchParams }: PageProps<"/ingredientes">) {
  await connection();
  const usuario = await exigirUsuario();
  const { rango: pedido } = await searchParams;
  const fecha = hoy();
  const inicioSiguiente = sumarDias(inicioSemana(fecha), 7);
  const hayProxima = tieneMinuta(await obtenerSemana(usuario.id, inicioSiguiente));
  const disponibles = RANGOS.filter((r) => r.id !== "proxima" || hayProxima);
  const rango: Rango = disponibles.some((r) => r.id === pedido) ? (pedido as Rango) : "semana";

  const fechas: Record<Rango, string[]> = {
    hoy: [fecha],
    manana: [sumarDias(fecha, 1)],
    semana: diasRestantes(fecha),
    proxima: diasDeSemana(inicioSiguiente),
  };
  const seleccion = fechas[rango];
  const [filas, catalogo] = await Promise.all([
    obtenerDias(usuario.id, seleccion[0], seleccion.at(-1)!),
    cargarCatalogo({ incluirEliminadas: true }),
  ]);
  const consumo: DiaConsumo[] = filas.flatMap((f) => {
    const almuerzo = catalogo.almuerzos.get(f.almuerzoId);
    const ensalada = catalogo.ensaladas.get(f.ensaladaId);
    return almuerzo && ensalada ? [{ comensales: f.comensales, vegetarianos: f.vegetarianos, almuerzo, ensalada, sustitutoId: f.sustitutoId }] : [];
  });
  const secciones = calcularListaCompras(consumo, catalogo, ORDEN_PASILLOS);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Ingredientes</h1>
      <nav className="flex flex-wrap gap-2" aria-label="Rango de días">
        {disponibles.map((r) => (
          <Link
            key={r.id}
            href={`/ingredientes?rango=${r.id}`}
            aria-current={r.id === rango ? "page" : undefined}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              r.id === rango ? "border-acento bg-acento text-acento-texto" : "border-borde bg-tarjeta text-suave"
            }`}
          >
            {r.texto}
          </Link>
        ))}
      </nav>
      <p className="text-sm text-suave">
        {consumo.length === 0
          ? "No hay días con minuta en este rango."
          : `${consumo.length} ${consumo.length === 1 ? "día" : "días"} con minuta. Sal, aceite, vinagre y especias no se incluyen.`}
      </p>

      <div className="space-y-5 lg:columns-2 lg:gap-5 lg:space-y-0 xl:columns-3">
      {secciones.map((s) => (
        <section key={s.pasillo} className="overflow-hidden rounded-xl border border-borde bg-tarjeta lg:mb-5 lg:break-inside-avoid">
          <h2 className="bg-acento-suave px-4 py-2 text-sm font-semibold text-acento">{nombrePasillo(s.pasillo)}</h2>
          <table className="w-full text-[15px]">
            <tbody>
              {s.items.map((item) => (
                <tr key={item.ingrediente.id} className="border-t border-borde first:border-t-0">
                  <td className="px-4 py-2 first-letter:uppercase">{item.ingrediente.nombre}</td>
                  <td className={`px-4 py-2 text-right ${item.soloOpcional ? "text-suave" : "font-medium"}`}>{item.texto}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
      </div>
    </div>
  );
}

export default function VistaIngredientes(props: PageProps<"/ingredientes">) {
  return (
    <Suspense fallback={<Cargando />}>
      <ContenidoVistaIngredientes {...props} />
    </Suspense>
  );
}
