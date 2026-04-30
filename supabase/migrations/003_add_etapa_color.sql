-- Migration: Add color column to funil_etapas
-- This allows custom colors for each pipeline stage

ALTER TABLE funil_etapas ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'bg-slate-400';

-- Add default colors to existing etapas
UPDATE funil_etapas SET color = 'bg-slate-400' WHERE position = 0;
UPDATE funil_etapas SET color = 'bg-blue-400' WHERE position = 1;
UPDATE funil_etapas SET color = 'bg-amber-400' WHERE position = 2;
UPDATE funil_etapas SET color = 'bg-violet-400' WHERE position = 3;
UPDATE funil_etapas SET color = 'bg-red-400' WHERE position = 4;
UPDATE funil_etapas SET color = 'bg-emerald-400' WHERE position = 5;
UPDATE funil_etapas SET color = 'bg-cyan-400' WHERE position = 6;