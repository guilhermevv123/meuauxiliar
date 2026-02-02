-- Migration to add status and ordem columns to lembretes table
-- This enables done/not-done status tracking and drag-and-drop ordering

-- Add status column (default: nao_feito)
ALTER TABLE lembretes 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'nao_feito' CHECK (status IN ('feito', 'nao_feito'));

-- Add ordem column for ordering (default: 0)
ALTER TABLE lembretes 
ADD COLUMN IF NOT EXISTS ordem integer DEFAULT 0;

-- Update existing records to set default status
UPDATE lembretes 
SET status = 'nao_feito' 
WHERE status IS NULL;

-- Create index for better query performance on lembretes without dates
CREATE INDEX IF NOT EXISTS idx_lembretes_sem_data_ordem 
ON lembretes (session_id, possui_data, ordem) 
WHERE possui_data = 'nao';

-- Update existing lembretes_sem_data with sequential ordem based on creation date
WITH ranked_lembretes AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY criado_em ASC) - 1 AS new_ordem
  FROM lembretes
  WHERE possui_data = 'nao' AND ordem = 0
)
UPDATE lembretes
SET ordem = ranked_lembretes.new_ordem
FROM ranked_lembretes
WHERE lembretes.id = ranked_lembretes.id;

-- Add comment for documentation
COMMENT ON COLUMN lembretes.status IS 'Status do lembrete: feito ou nao_feito';
COMMENT ON COLUMN lembretes.ordem IS 'Ordem de exibição do lembrete (usado para drag-and-drop)';
