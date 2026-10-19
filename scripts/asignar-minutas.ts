// Asigna las minutas creadas antes de que existieran usuarios a la cuenta con el email indicado.
// Uso: npm run db:asignar-minutas -- tu@email.com   (la cuenta debe haber iniciado sesión una vez)
import { and, eq, sql } from "drizzle-orm";
import { db } from "../src/servidor/db";
import { dias, semanas, SIN_USUARIO, user } from "../src/servidor/esquema";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) throw new Error("Indica el email: npm run db:asignar-minutas -- tu@email.com");
  const [cuenta] = await db.select().from(user).where(eq(user.email, email));
  if (!cuenta) throw new Error(`No existe una cuenta con el email ${email}. Inicia sesión una vez con Google y vuelve a intentarlo.`);

  // Las fechas y semanas que la cuenta ya planificó por su cuenta se respetan: no se sobrescriben.
  const [diasAsignados, semanasAsignadas] = await db.batch([
    db
      .update(dias)
      .set({ usuarioId: cuenta.id })
      .where(
        and(
          eq(dias.usuarioId, SIN_USUARIO),
          sql`${dias.fecha} NOT IN (SELECT fecha FROM dias WHERE usuario_id = ${cuenta.id})`,
        ),
      )
      .returning({ fecha: dias.fecha }),
    db
      .update(semanas)
      .set({ usuarioId: cuenta.id })
      .where(
        and(
          eq(semanas.usuarioId, SIN_USUARIO),
          sql`${semanas.inicio} NOT IN (SELECT inicio FROM semanas WHERE usuario_id = ${cuenta.id})`,
        ),
      )
      .returning({ inicio: semanas.inicio }),
  ]);
  const pendientes = await db.select({ fecha: dias.fecha }).from(dias).where(eq(dias.usuarioId, SIN_USUARIO));
  console.log(`Asignados a ${email}: ${semanasAsignadas.length} semanas y ${diasAsignados.length} días.`);
  if (pendientes.length)
    console.log(`Se omitieron ${pendientes.length} días porque la cuenta ya tenía minuta en esas fechas.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
