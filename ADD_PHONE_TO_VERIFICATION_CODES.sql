-- Adicionar coluna 'phone' na tabela verification_codes existente
-- Isso permite usar a mesma tabela para verificação por email E por telefone

ALTER TABLE verification_codes 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Criar índice para melhorar performance de busca por telefone
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);

-- Comentário
COMMENT ON COLUMN verification_codes.phone IS 'Número de telefone para verificação (alternativa ao email)';
