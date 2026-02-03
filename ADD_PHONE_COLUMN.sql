-- Adicionar colunas necessárias na tabela verification_codes
-- Para suportar verificação por email E telefone

ALTER TABLE verification_codes 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE verification_codes 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE verification_codes 
ADD COLUMN IF NOT EXISTS code TEXT;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- Comentários
COMMENT ON COLUMN verification_codes.phone IS 'Número de telefone para verificação (alternativa ao email)';
COMMENT ON COLUMN verification_codes.code IS 'Código de verificação de 6 dígitos';
COMMENT ON COLUMN verification_codes.expires_at IS 'Data/hora de expiração do código';
