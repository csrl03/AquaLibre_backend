-- AquaLibre - Migracion 003
-- Agrega identidad anonima e idempotencia para Mis Reportes.

BEGIN;

ALTER TABLE reportes_uso
    ADD COLUMN IF NOT EXISTS cliente_id VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cliente_reporte_id VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reportes_cliente_reporte
    ON reportes_uso (cliente_id, cliente_reporte_id)
    WHERE cliente_id IS NOT NULL AND cliente_reporte_id IS NOT NULL;

COMMIT;