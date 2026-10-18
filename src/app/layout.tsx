import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { BarraNavegacion, Navegacion } from "@/componentes/Navegacion";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comideitor3000",
  description: "Planificación semanal de almuerzos, ensaladas y lista de compras.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <Suspense fallback={<BarraNavegacion ruta={null} />}>
          <Navegacion />
        </Suspense>
        <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-4">{children}</main>
      </body>
    </html>
  );
}
