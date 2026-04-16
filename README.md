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

## Despliegue (Railway)

1. Conectar este repositorio en Railway como nuevo servicio
2. Configurar las variables de entorno en la pestaña **Variables**
3. Railway detecta `npm start` automáticamente
