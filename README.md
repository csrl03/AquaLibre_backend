# AquaLibre — Backend API

REST API para la app móvil AquaLibre, sistema de gestión de recursos hídricos del municipio de Chocontá, Cundinamarca.

## Stack

- **Node.js** + **Express 4**
- **PostgreSQL** (Railway) con extensión PostGIS
- Autenticación de origen via CORS configurable
- Rate limiting en endpoints de escritura

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del servidor |
| GET | `/api/fuentes` | Lista de fuentes hídricas (paginada, filtrable) |
| GET | `/api/fuentes/buscar?q=` | Búsqueda por nombre de fuente |
| GET | `/api/fuentes/:id` | Detalle de una fuente |
| GET | `/api/fuentes/:id/reportes` | Reportes asociados a una fuente |
| GET | `/api/estaciones` | Lista de estaciones hidrometeorológicas |
| GET | `/api/estaciones/:id` | Detalle completo de una estación |
| POST | `/api/reportes` | Registrar reporte de uso hídrico |
| GET | `/api/capas/:nombre` | GeoJSON de capa SIG (municipio, drenajes, veredas) |
| GET | `/api/contenido` | Contenido educativo |

## Configuración

```bash
cp .env.example .env
# Editar .env con credenciales reales de Railway
npm install
npm run dev
```

## Variables de entorno

Ver `.env.example` para la lista completa. Las variables requeridas son:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — conexión PostgreSQL
- `PORT` — puerto del servidor (default: 3000)
- `CORS_ORIGINS` — orígenes permitidos separados por coma (usar `*` en desarrollo)

### Cuerpo de `POST /api/reportes`

El campo `actividades` es obligatorio y recibe una o varias actividades:

```json
{
	"fuente_id": "uuid",
	"nombre_usuario": "Juan Morales",
	"actividades": ["Consumo doméstico", "Demanda pecuario"],
	"campos_extra": {
		"actividades": {
			"Consumo doméstico": {
				"unidad_medida": "L/Día",
				"numero_usuarios": 4,
				"dotacion_bruta": 171.43,
				"demanda_hidrica_domestica": 685.71
			},
			"Demanda pecuario": {
				"unidad_medida": "L/día",
				"animales": [
					{
						"especie": "Vacas lecheras",
						"cantidad": 3,
						"consumo_promedio_diario": 75,
						"consumo_estimado_diario": 225
					},
					{
						"especie": "Perros",
						"cantidad": 2,
						"peso_kg": 12,
						"consumo_promedio_diario": 0.06,
						"consumo_estimado_diario": 1.44
					}
				],
				"demanda_pecuaria": 226.44
			}
		}
	}
}
```

La columna `actividad` conserva un resumen textual separado por comas para
compatibilidad, mientras `actividades` conserva el arreglo canónico. La
cantidad de agua ya no se solicita en el formulario general; cada actividad
guarda sus propios resultados y unidad dentro de `campos_extra.actividades`.

Para `Demanda uso agricola`, la app selecciona la estación más cercana a la
fuente mediante sus coordenadas y usa directamente su promedio de
`VALORES TOTALES DE EVAPORACIÓN (mm)` como `ET0`. El listado de estaciones
incluye `et0` y `et0_periodo` para evitar consultas adicionales. Los cultivos
guardan `area_ha`, `kc_maximo`, `kc_promedio`, `kc_operativo` y el estado del
cálculo; si falta `Kc`, el formulario se guarda con cálculo pendiente.

## Despliegue (Railway)

1. Conectar este repositorio en Railway como nuevo servicio
2. Configurar las variables de entorno en la pestaña **Variables**
3. Railway detecta `npm start` automáticamente
