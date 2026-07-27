-- AquaLibre - Migracion 004
-- Permite reportes basados en ubicación GPS/manual/sin-ubicación
-- donde fuente_id es NULL (la ubicación se guarda en campos_extra.ubicacion).
--
-- Causa: "null value in column 'fuente_id' of relation 'reportes_uso'
--         violates not-null constraint"
--
-- Ejecutar en Railway:
--   psql "$DATABASE_URL" -f db/migrations/004_reportes_fuente_id_nullable.sql

BEGIN;

ALTER TABLE reportes_uso
    ALTER COLUMN fuente_id DROP NOT NULL;

COMMIT;