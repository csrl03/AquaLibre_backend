-- AquaLibre — Migration: cliente_auth table (DEF-010 fix)
-- Run this in the Railway PostgreSQL database to add anonymous auth.
--
-- Usage:
--   railway run psql -f db/migration_cliente_auth.sql
--   or paste in Railway DB console

CREATE TABLE IF NOT EXISTS cliente_auth (
    cliente_id  VARCHAR(100) PRIMARY KEY,
    token_hash  CHAR(64) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);