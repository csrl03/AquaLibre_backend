-- AquaLibre — PostgreSQL + PostGIS Schema
-- Run ONCE after creating the database:
--   psql -h <host> -U <user> -d aqualib -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────────────────────
-- fuentes_hidricas
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fuentes_hidricas (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediente           VARCHAR(100),
    nombre_fuente        VARCHAR(255),
    tipo_captacion       VARCHAR(100),
    uso_principal        VARCHAR(100),
    caudal_ls            DECIMAL(12, 4),
    subzona_hidrografica VARCHAR(255),
    cuenca_tercer_orden  VARCHAR(255),
    municipio            VARCHAR(100) NOT NULL DEFAULT 'Chocontá',
    vereda               VARCHAR(255),
    usuario_titular      VARCHAR(255),
    acueducto            VARCHAR(255),
    lat                  DECIMAL(10, 7),
    lon                  DECIMAL(10, 7),
    fuente_origen        VARCHAR(100),
    es_vertimiento       BOOLEAN NOT NULL DEFAULT FALSE,
    cuerpo_receptor      VARCHAR(255),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fuentes_municipio   ON fuentes_hidricas (municipio);
CREATE INDEX IF NOT EXISTS idx_fuentes_vereda       ON fuentes_hidricas (vereda);
CREATE INDEX IF NOT EXISTS idx_fuentes_uso          ON fuentes_hidricas (uso_principal);
CREATE INDEX IF NOT EXISTS idx_fuentes_tipo         ON fuentes_hidricas (tipo_captacion);
CREATE INDEX IF NOT EXISTS idx_fuentes_vertimiento  ON fuentes_hidricas (es_vertimiento);

-- ────────────────────────────────────────────────────────────────────────────
-- reportes_uso
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reportes_uso (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fuente_id     UUID NOT NULL REFERENCES fuentes_hidricas(id) ON DELETE CASCADE,
    nombre_usuario VARCHAR(255),
    actividad     TEXT NOT NULL,
    cantidad_agua DECIMAL(12, 4),
    unidad_agua   VARCHAR(20) DEFAULT 'L/s',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    campos_extra  JSONB
);

CREATE INDEX IF NOT EXISTS idx_reportes_fuente     ON reportes_uso (fuente_id);
CREATE INDEX IF NOT EXISTS idx_reportes_created_at ON reportes_uso (created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- capas_geo
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS capas_geo (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_capa VARCHAR(50) UNIQUE NOT NULL,
    geojson     JSONB NOT NULL,
    metadata    JSONB,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────────────────────
-- contenido_educativo
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contenido_educativo (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo         VARCHAR(255) NOT NULL,
    tipo           VARCHAR(20) NOT NULL CHECK (tipo IN ('video', 'articulo', 'consejo')),
    categoria      VARCHAR(100),
    url_contenido  TEXT,
    resumen        TEXT,
    imagen_portada TEXT,
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contenido_tipo      ON contenido_educativo (tipo);
CREATE INDEX IF NOT EXISTS idx_contenido_categoria ON contenido_educativo (categoria);
