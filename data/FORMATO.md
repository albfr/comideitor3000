# Formato del catálogo (`catalogo.json`)

El catálogo inicial se carga desde `catalogo.json` mediante un script. Todas las cantidades se guardan en **gramos por porción**.

## Estructura general
```json
{
  "version": 1,
  "categorias_almuerzo": [ ... ],
  "ingredientes": [ ... ],
  "sustitutos_carne": [ ... ],
  "almuerzos": [ ... ],
  "ensaladas": [ ... ]
}
```

## `categorias_almuerzo`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador (`legumbres`, `pescados_mariscos_algas`, `carne_roja`, `ave`, `pastas`, `vegetariano`) |
| `nombre` | string | Nombre visible |
| `limite_semanal` | number \| null | Máximo de almuerzos de la categoría por semana. `null` mientras no se defina |

## `ingredientes`
| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | string | sí | Identificador único, en minúsculas y sin tildes |
| `nombre` | string | sí | Nombre visible |
| `pasillo` | string | sí | Pasillo del supermercado; un `id` de `prompt_clasificacion_alimentos.json` |
| `grupo` | string | no | `legumbre`, `carne`, `pescado_marisco`, `alga` o `sustituto_carne`. Se usa para las reglas de la minuta |
| `basico_despensa` | boolean | no | `true` para sal, aceite, vinagre y especias: no aparecen en la lista de compras y no cuentan para la regla de ingredientes repetidos entre almuerzo y ensalada |
| `unidad` | objeto | no | Equivalencia a unidades de compra: `{ "singular": "tomate mediano", "plural": "tomates medianos", "gramos": 100 }`. Sin ella, la cantidad se muestra solo en gramos |
| `gramos_por_cucharada` | number | si se usa en cucharadas | Conversión para sumar cucharadas en la lista de compras |

Con `unidad`, una cantidad se muestra como `150 g de tomate (1,5 tomates medianos)`. Las unidades se redondean a la media unidad más cercana, con un mínimo de 0,5.

## `sustitutos_carne`
| Campo | Tipo | Descripción |
|---|---|---|
| `ingrediente` | string | `id` de un ingrediente con `grupo: "sustituto_carne"` |
| `gramos_por_porcion` | number | Cantidad por porción |

Cuando un almuerzo contiene un ingrediente de grupo `carne` o `pescado_marisco`, el generador elige al azar uno de estos sustitutos.

## `almuerzos`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único |
| `nombre` | string | Nombre visible |
| `categoria` | string | `id` de `categorias_almuerzo` |
| `dificultad` | string | `baja`, `media`, `alta` o `muy_alta` |
| `tiempo_minutos` | number | Tiempo de preparación |
| `imagen` | string \| null | Ruta local de la imagen que el script sube a Vercel Blob. `null` muestra una imagen genérica |
| `ingredientes` | lista | Líneas de ingrediente (ver abajo) |
| `preparacion` | lista de string | Pasos en orden |

## `ensaladas`
| Campo | Tipo | Descripción |
|---|---|---|
| `id` | string | Identificador único (no puede coincidir con el de un almuerzo) |
| `nombre` | string | Nombre visible |
| `dificultad` | string | `baja` o `media` |
| `ingredientes` | lista | Líneas de ingrediente |

## Líneas de ingrediente
```json
{ "ingrediente": "tomate", "cantidad": 150, "unidad": "g" }
{ "ingrediente": "aceite", "cantidad": 1, "unidad": "cucharada" }
{ "ingrediente": "cilantro", "opcional": true }
```
- `unidad` es `g` o `cucharada`. Las cantidades son por porción.
- Un ingrediente "al gusto" se marca con `"opcional": true` y no lleva cantidad. En la lista de compras aparece sin cantidad, salvo que sea básico de despensa.
- Un ingrediente no puede repetirse dentro de una misma receta.

## Cómo se evalúan las reglas
- **Día con legumbres:** el almuerzo o la ensalada tiene un ingrediente no opcional de grupo `legumbre`.
- **Día con pescados, mariscos o algas:** el almuerzo o la ensalada tiene un ingrediente no opcional de grupo `pescado_marisco` o `alga`.
- **Ingredientes repetidos entre almuerzo y ensalada:** se comparan todos los ingredientes, incluidos los opcionales, excepto los básicos de despensa.
