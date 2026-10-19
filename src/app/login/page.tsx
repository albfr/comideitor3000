import { Suspense } from "react";
import { BotonGoogle } from "@/componentes/BotonGoogle";

async function MensajeError({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  if (!error) return null;
  return (
    <p role="alert" className="rounded-xl border border-peligro/40 bg-peligro-suave p-3 text-sm text-peligro">
      No se pudo iniciar sesión. Revisa que tu email de Google esté autorizado para usar Comideitor3000.
    </p>
  );
}

export default function Login(props: PageProps<"/login">) {
  const googleConfigurado = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
  return (
    <div className="mx-auto max-w-sm space-y-6 pt-16">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-acento">Comideitor3000</h1>
        <p className="text-sm text-suave">Planifica tus almuerzos y ensaladas de la semana.</p>
      </div>
      <Suspense fallback={null}>
        <MensajeError {...props} />
      </Suspense>
      {googleConfigurado ? (
        <BotonGoogle />
      ) : (
        <p className="rounded-xl border border-borde bg-tarjeta p-3 text-sm text-suave">
          Falta configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET (ver README).
        </p>
      )}
    </div>
  );
}
