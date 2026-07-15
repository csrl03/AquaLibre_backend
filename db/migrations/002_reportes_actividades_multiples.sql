-- AquaLibre — Migración 002
-- Agrega selección múltiple de actividades a reportes existentes.
-- Ejecutar una vez contra la base de datos ya instalada.

BEGIN;

ALTER TABLE reportes_uso
    ADD COLUMN IF NOT EXISTS actividades JSONB;

UPDATE reportes_uso
SET actividades = jsonb_build_array(actividad)
WHERE actividades IS NULL AND actividad IS NOT NULL;

UPDATE reportes_uso
SET actividades = '[]'::jsonb
WHERE actividades IS NULL;

ALTER TABLE reportes_uso
    ALTER COLUMN actividades SET DEFAULT '[]'::jsonb,
    ALTER COLUMN actividades SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'reportes_actividades_array_check'
          AND conrelid = 'reportes_uso'::regclass
    ) THEN
        ALTER TABLE reportes_uso
            ADD CONSTRAINT reportes_actividades_array_check
            CHECK (jsonb_typeof(actividades) = 'array');
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reportes_actividades
    ON reportes_uso USING GIN (actividades);

COMMIT;
