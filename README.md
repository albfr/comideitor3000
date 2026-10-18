# Comideitor3000
Comideitor3000 es una aplicación web que permite a los dueños de casa planificar de mejor forma los almuerzos que cocinarán en la semana y las compras para estas comidas proponiendo distintas minutas según las necesidades nutricionales de los usuarios.

## Historias de Usuario
" Como dueño de casa necesito que el sistema...
- Me proponga tres alternativas de minuta para la siguiente semana, estas alternativas deben incluir almuerzo y ensalada, 
- Que me dé la lista de ingredientes para la semana,
- Poder ver la minuta de esta semana y la próxima,
- Acceder fácilmente a lo que toca cocinar hoy y cualquier día de esta semana y la próxima,
- Permitir alterar el orden de las opciones en la próxima semana y próximos dias de esta semana

Se asume que todas las recetas de almuerzo ingresadas al catálogo son nutricionalmente balanceadas.

## Requisitos Funcionales

### Restricciones alimentarias
- **RF-01:** El sistema debe considerar que en el hogar puede haber integrantes vegetarianos, lo que se cubre con los sustitutos de carne (RF-04). Otras restricciones (celíaco, intolerancia a la lactosa, alergias, alimentos que no gustan) quedan fuera del alcance por ahora.

### Comensales
- **RF-02:** El sistema debe permitir indicar y modificar cuántos integrantes del hogar almorzarán cada día de la semana actual y de la siguiente, para calcular las cantidades de la lista de compras (RF-13). El valor por defecto es 3 comensales y el mínimo es 1.

### Catálogo de almuerzos
- **RF-03:** El sistema debe mantener un catálogo de almuerzos, cada uno con nombre, imagen (opcional; si falta se muestra una imagen genérica), ingredientes (con cantidad por porción en gramos o cucharadas; los ingredientes "al gusto" se marcan como opcionales), preparación, tiempo de preparación y nivel de dificultad (bajo, medio, alto o muy alto).
- **RF-04:** El sistema debe mantener un conjunto de sustitutos de carne (por ejemplo: tofu, seitán, soya texturizada). Cuando un almuerzo de la minuta contiene carne, ave, pescado o mariscos, el generador le asigna al azar uno de estos sustitutos. El almuerzo conserva su categoría original.
- **RF-05:** El sistema debe permitir agregar, editar y eliminar almuerzos del catálogo.
- **RF-06:** El sistema debe clasificar cada almuerzo en una categoría (legumbres; pescados, mariscos y algas; carne roja; ave; pastas; vegetariano) para poder balancear la variedad semanal. Cada categoría tendrá un límite semanal, por definir.

### Catálogo de ensaladas
- **RF-07:** El sistema debe mantener un catálogo de ensaladas, independiente del de almuerzos, cada una con nombre, ingredientes (con cantidad por porción, igual que en RF-03) y nivel de dificultad (bajo o medio).
- **RF-08:** El sistema debe permitir agregar, editar y eliminar ensaladas del catálogo.

### Generación de minutas
- **RF-09:** El sistema debe generar tres alternativas de minuta para la semana siguiente, cada una con un almuerzo y una ensalada por día, para los siete días de la semana. Las alternativas se generan una sola vez por semana y no cambian al volver a consultarlas. Si la semana actual no tiene minuta seleccionada, se generan alternativas para los días restantes de la semana actual, incluyendo hoy.
- **RF-10:** Cada alternativa debe respetar las reglas de la sección [Restricciones](#restricciones). Si el catálogo no permite generar minutas que las cumplan, el sistema debe mostrar una advertencia indicándolo.
- **RF-11:** Cada alternativa debe incluir variedad de categorías durante la semana, evitando repetir el mismo almuerzo y respetando el límite semanal de cada categoría (RF-06).
- **RF-12:** El sistema debe permitir seleccionar una de las tres alternativas como la minuta oficial de la semana siguiente. Una vez seleccionada, la elección no se puede cambiar.

### Lista de compras
- **RF-13:** El sistema debe generar la lista de ingredientes de la minuta seleccionada, incluyendo almuerzos y ensaladas, sumando las cantidades de un mismo ingrediente entre todas las recetas y ajustándolas al número de comensales de cada día (RF-02). Incluye los sustitutos de carne asignados (RF-04). Los ingredientes opcionales aparecen sin cantidad.
- **RF-14:** El sistema debe agrupar la lista de compras por categoría o sección del supermercado (por ejemplo: verduras, carnes, lácteos, abarrotes).
- **RF-15:** El sistema debe actualizar la lista de compras automáticamente cuando se modifique la minuta o el número de comensales de algún día (RF-02).
- **RF-16:** La lista de compras no debe incluir los ingredientes marcados como básicos de despensa (sal, aceite, vinagre y especias), aunque sí aparezcan en las recetas.

### Visualización
- **RF-17:** El sistema debe mostrar la minuta de la semana actual y la de la semana siguiente.
- **RF-18:** El sistema debe mostrar en la pantalla de inicio, de forma destacada, el almuerzo y la ensalada que corresponde preparar hoy, con sus ingredientes (con las cantidades multiplicadas por los comensales del día), la preparación del almuerzo, su tiempo de preparación y su nivel de dificultad.
- **RF-19:** El sistema debe permitir consultar el detalle del almuerzo y la ensalada de cualquier día de la semana actual y de la siguiente.

### Modificación de la minuta
- **RF-20:** El sistema debe permitir reordenar los días de la semana siguiente arrastrando un día a la posición deseada; los días intermedios se desplazan. El almuerzo y la ensalada de un día se mueven juntos. El reordenamiento se permite aunque deje de cumplir las reglas de [Restricciones](#restricciones).
- **RF-21:** El sistema debe permitir reordenar de la misma forma los días restantes de la semana actual, incluyendo hoy, sin modificar los días ya pasados.

### Historial
- **RF-22:** El sistema debe guardar las minutas de semanas anteriores para evitar repetir en una semana los almuerzos de la semana inmediatamente anterior. Esta regla no aplica a las ensaladas.

## Requisitos Opcionales (futuros)
- **RF-23:** El sistema debe registrar la información nutricional por porción de cada almuerzo.
- **RF-24:** El sistema debe permitir comparar las tres alternativas de minuta mostrando su resumen nutricional semanal.
- **RF-25:** El sistema debe permitir registrar a los integrantes del hogar que almuerzan en casa, indicando para cada uno edad, sexo y nivel de actividad física.
- **RF-26:** El sistema debe permitir solicitar nuevas alternativas si ninguna de las propuestas es satisfactoria.
- **RF-27:** El sistema debe permitir configurar qué días de la semana se planifican (por ejemplo: solo de lunes a viernes).
- **RF-28:** El sistema debe permitir marcar los ingredientes ya comprados o que ya se tienen en casa.
- **RF-29:** El sistema debe permitir reemplazar un plato puntual por otro del catálogo y advertir si el cambio desbalancea nutricionalmente la semana.
- **RF-30:** El sistema debe permitir subir las imágenes de los almuerzos desde la interfaz. Mientras tanto, las imágenes se cargan a mano o mediante un script.

## Requisitos No Funcionales

### Usabilidad
- **RNF-01:** La interfaz debe estar en español. Las cantidades se guardan en gramos y se muestran en gramos o kilos; si el ingrediente tiene una equivalencia en unidades se agrega entre paréntesis, por ejemplo "150 g de tomate (1,5 tomates medianos)". Si no tiene equivalencia, se muestran solo los gramos. La cucharada es una unidad propia y los ingredientes "al gusto" se muestran como opcionales.
- **RNF-02:** La aplicación debe ser responsiva y cómoda de usar tanto en el computador como en el celular, considerando que se consultará mientras se cocina o se compra.
- **RNF-03:** El almuerzo y la ensalada del día (RF-18) deben verse al abrir la aplicación, sin necesidad de navegar.
- **RNF-04:** Reordenar días (RF-20 y RF-21) debe hacerse con un solo gesto de arrastrar y soltar, también en pantallas táctiles.

### Rendimiento
- **RNF-05:** La generación de las tres alternativas de minuta (RF-09) debe completarse en menos de 10 segundos.
- **RNF-06:** Las pantallas de consulta (minuta, plato del día, lista de compras) deben cargar en menos de 2 segundos.

### Persistencia y respaldo
- **RNF-07:** Todos los datos (catálogo, minutas, comensales, restricciones e historial) deben persistir entre sesiones y reinicios de la aplicación.

### Seguridad
- **RNF-08:** La aplicación está pensada para un único usuario y no requiere gestión de cuentas ni roles.
- **RNF-09:** Como la aplicación se publica en internet, el acceso debe estar protegido con contraseña y servirse por HTTPS.

### Exactitud
- **RNF-10:** "Hoy" y el inicio de cada semana deben calcularse según la zona horaria fija `America/Santiago`, independiente de la zona horaria del servidor. La semana comienza el lunes.
- **RNF-11:** Las cantidades de la lista de compras deben expresarse en unidades razonables para comprar (por ejemplo, 1,2 kg en lugar de 1200 g, o bien 1 huevo, 3 espárragos, etc...). Las unidades se aproximan a la media unidad más cercana, con un mínimo de 0,5 (por ejemplo, 1,5 cebollas).

### Compatibilidad y mantenibilidad
- **RNF-12:** La aplicación debe funcionar en las versiones actuales de Chrome, Firefox, Safari y Edge.
- **RNF-13:** La lógica de generación de minutas y de cálculo de la lista de compras debe contar con pruebas automatizadas.

## Interfaz
### Vista principal
Corresponde al almuerzo y ensalada del día de hoy.
En la parte superior se muestra el nombre del almuerzo.
Muestra los datos: dificultad, tiempo del almuerzo y categoría.
Para mostrar la ensalada, se listan sus ingredientes.
Muestra una lista con los ingredientes y sus unidades de medida.
Las cantidades de los ingredientes se muestran multiplicadas por los comensales del día.
Si el almuerzo tiene un sustituto de carne asignado, se muestra junto a los ingredientes.
Muestra la imagen del almuerzo, o una imagen genérica si no tiene.
Al scrollear hacia abajo se debe mostrar la receta o preparación del almuerzo
Tiene botones para acceder a la vista bisemanal, a la vista de ingredientes y a la vista de catálogo
Únicamente los sábados y domingos habrá un botón especial con el cual se podrá acceder a la vista de propuestas de minutas, debe tener colores y/o animaciones llamativas.

En caso de que no se haya seleccionado una minuta para la semana actual, se debe mostrar una alerta que indique que no hay una minuta escogida y un botón que te dirija a la vista de propuestas considerando solo los días restantes de la semana incluyendo el día actual
### Propuestas de minuta
A esta vista solo se puede acceder el día Sábado y Domingo, excepto cuando la semana actual no tiene minuta seleccionada: en ese caso se accede desde la alerta de la vista principal y las propuestas cubren solo los días restantes de la semana, incluyendo hoy.
Mostrará las tres opciones de minuta para la semana siguiente, permite explorar cada minuta semanal, y para cada minuta semanal permite observar el detalle de cada receta al mismo nivel de detalle que la vista principal.
Las propuestas se generan una sola vez y se mantienen iguales durante el fin de semana. Una vez escogida una minuta, la elección no se puede cambiar.
### Vista bisemanal
Muestra la minuta de la semana actual y en caso de haber seleccionado la minuta de la próxima semana, se mostrarán la minuta actual y la próxima, incluyendo nombres de los días de la semana y el día del mes (1, 2, 20, ...)
Cada día muestra la cantidad de comensales, con un botón '-' a la izquierda y un botón '+' a la derecha para modificarla (RF-02). El mínimo es 1 comensal. Los días ya pasados no se pueden modificar.
Los días se reordenan arrastrándolos a la posición deseada (RF-20 y RF-21). Al tocar un día se abre el detalle de su almuerzo y ensalada (RF-19).
### Vista de ingredientes
Se muestra una lista de ingredientes en una tabla y las cantidades necesarias. Esta vista permite togglear entre hoy, mañana, los días restantes de la semana (incluyendo hoy) y en caso de haber seleccionado la minuta de la próxima semana, también se pueda ver el total de la próxima semana.
### Vista de catálogo
Lista los almuerzos y las ensaladas del catálogo, permite ver el detalle de cada uno, agregar nuevos, editarlos y eliminarlos (RF-05 y RF-08). Subir imágenes desde esta vista queda para más adelante (RF-30).

## Restricciones
- Dos veces a la semana legumbres (al menos una vez debe ser almuerzo)
- Dos veces a la semana pescados, mariscos o algas
- No se pueden repetir dos días seguidos la misma categoría de almuerzo
- No se pueden repetir ingredientes entre la ensalada y el almuerzo de un mismo día, salvo los básicos de despensa (sal, aceite, vinagre y especias)
- Una misma ensalada se puede repetir como máximo dos días seguidos
- No se pueden repetir los almuerzos de la semana anterior (RF-22)

Precisiones:
- Un día cuenta como "de legumbres" o "de pescados, mariscos o algas" si el almuerzo o la ensalada tiene un ingrediente no opcional de ese grupo (por ejemplo, una ensalada con lentejas cuenta como legumbres).
- En una semana parcial (por ejemplo, cuando se planifica a mitad de semana) los mínimos se calculan en proporción a los días planificados, redondeando hacia abajo: `piso(2 × días / 7)`.
- Las reglas de días seguidos (categoría de almuerzo y repetición de ensaladas) también se aplican entre el domingo de una semana y el lunes de la siguiente.

## Stack tecnológico
- **Framework:** Next.js con TypeScript (frontend y backend en un mismo proyecto).
- **Base de datos:** Turso (SQLite / libSQL).
- **Imágenes:** Vercel Blob.
- **Despliegue:** Vercel.
- **ORM y migraciones:** Drizzle.
- **Pruebas:** Vitest.
- **Estilos:** Tailwind CSS.
- **Fechas y zona horaria:** date-fns y date-fns-tz.
- **Arrastrar y soltar:** dnd-kit.

## Catálogo inicial
El catálogo inicial está en [data/catalogo.json](data/catalogo.json) y su formato se describe en [data/FORMATO.md](data/FORMATO.md). Los pasillos del supermercado de cada ingrediente provienen de [prompt_clasificacion_alimentos.json](prompt_clasificacion_alimentos.json).

## Desarrollo

Requiere Node.js 22 o superior.

```bash
npm install
cp .env.example .env.local   # opcional en desarrollo
npm run db:migrar            # crea las tablas (en local.db si no hay TURSO_DATABASE_URL)
npm run db:cargar            # carga data/catalogo.json
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:3000 |
| `npm test` | Pruebas de la lógica de minutas, reglas, cantidades y lista de compras (RNF-13) |
| `npm run lint` | ESLint |
| `npm run build` | Compilación de producción |
| `npm run db:generar` | Genera una migración en `drizzle/` después de cambiar `src/servidor/esquema.ts` |
| `npm run db:migrar` | Aplica las migraciones |
| `npm run db:cargar` | Carga o actualiza el catálogo desde `data/catalogo.json` y sube sus imágenes a Vercel Blob |

Sin `APP_PASSWORD`, en desarrollo la aplicación queda abierta; en producción exige la variable.

### Estructura
- `src/dominio/`: lógica pura y probada (generador, reglas, cantidades, lista de compras, fechas). No depende de Next.js ni de la base de datos.
- `src/servidor/`: base de datos (Drizzle + libSQL), carga del catálogo, minutas y sesión.
- `src/app/`: páginas y acciones de servidor. `src/componentes/`: componentes de interfaz.
- `src/proxy.ts`: redirige a `/login` si no hay sesión.

## Despliegue en Vercel

1. Crear una base de datos en Turso (`turso db create comideitor3000`) y obtener su URL y un token (`turso db tokens create comideitor3000`).
2. Crear un almacén de Vercel Blob en el proyecto de Vercel; esto agrega `BLOB_READ_WRITE_TOKEN`.
3. Definir en Vercel las variables `APP_PASSWORD`, `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`.
4. Desde tu equipo, con esas mismas variables en `.env.local`, ejecutar `npm run db:migrar` y `npm run db:cargar`.
5. Conectar el repositorio a Vercel y desplegar. Vercel sirve la aplicación por HTTPS.

## Decisiones provisorias del MVP
- **Sustituto de carne:** se compra 1 porción por día con almuerzo con carne, independiente de los comensales.
- **Eliminar recetas:** es una eliminación lógica. La receta desaparece del catálogo y de las nuevas propuestas, pero las minutas que ya la usan la siguen mostrando.
- **Reordenar:** solo dentro de la misma semana.
- **Imágenes:** se cargan con `npm run db:cargar` (campo `imagen` de `data/catalogo.json`, ruta relativa a `data/`); desde la interfaz aún no se pueden subir (RF-30).
- **Límite conocido:** si la semana actual se planifica después de elegir la siguiente, el generador no revisa la regla de días seguidos entre ese domingo y el lunes siguiente.

## Puntos por definir
1. Motor de generación de minutas. Mientras se define, las alternativas se generan de forma pseudoaleatoria respetando las reglas de [Restricciones](#restricciones).
2. Límite semanal de cada categoría de almuerzo (RF-06)
3. Cuántas porciones del sustituto de carne se compran por día (RF-04)
4. Confirmar el comportamiento al eliminar recetas (ver decisiones provisorias)
