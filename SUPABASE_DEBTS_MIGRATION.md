# Migração Supabase - Dívidas e Status de Pagamento

## 1. Adicionar coluna `status` na tabela `financeiro_clientes`

Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Adicionar coluna status para controlar pago/a pagar
ALTER TABLE financeiro_clientes 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pago';

-- Adicionar constraint para validar valores
ALTER TABLE financeiro_clientes
ADD CONSTRAINT check_status CHECK (status IN ('pago', 'a_pagar'));

-- Atualizar registros existentes como 'pago'
UPDATE financeiro_clientes 
SET status = 'pago' 
WHERE status IS NULL;
```

## 2. Criar tabela `dividas_financiamentos`

```sql
-- Criar tabela para dívidas e financiamentos
CREATE TABLE IF NOT EXISTS dividas_financiamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_cliente TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('divida', 'financiamento')),
  descricao TEXT NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  parcelas_total INTEGER,
  parcelas_pagas INTEGER DEFAULT 0,
  taxa_juros DECIMAL(5, 2),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_dividas_numero_cliente 
ON dividas_financiamentos(numero_cliente);

-- Criar índice para tipo
CREATE INDEX IF NOT EXISTS idx_dividas_tipo 
ON dividas_financiamentos(tipo);
```

## 3. Habilitar Row Level Security (RLS)

```sql
-- Habilitar RLS na tabela dividas_financiamentos
ALTER TABLE dividas_financiamentos ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que usuários vejam apenas suas próprias dívidas
CREATE POLICY "Usuários podem ver suas próprias dívidas"
ON dividas_financiamentos
FOR SELECT
USING (numero_cliente = current_setting('app.current_user_id', true));

-- Criar política para permitir inserção
CREATE POLICY "Usuários podem inserir suas próprias dívidas"
ON dividas_financiamentos
FOR INSERT
WITH CHECK (numero_cliente = current_setting('app.current_user_id', true));

-- Criar política para permitir atualização
CREATE POLICY "Usuários podem atualizar suas próprias dívidas"
ON dividas_financiamentos
FOR UPDATE
USING (numero_cliente = current_setting('app.current_user_id', true));

-- Criar política para permitir exclusão
CREATE POLICY "Usuários podem deletar suas próprias dívidas"
ON dividas_financiamentos
FOR DELETE
USING (numero_cliente = current_setting('app.current_user_id', true));
```

## 4. Criar função para atualizar timestamp

```sql
-- Função para atualizar automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER trigger_atualizar_timestamp
BEFORE UPDATE ON dividas_financiamentos
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();
```

## Estrutura Final

### Tabela `financeiro_clientes` (atualizada)
- `id` - identificador
- `numero_cliente` - número do cliente
- `categoria` - categoria da transação
- `tipo` - 'entrada' ou 'saida'
- `valor` - valor da transação
- `descricao` - descrição
- `data_transacao` - data da transação
- **`status`** - 'pago' ou 'a_pagar' ✨ NOVO

### Tabela `dividas_financiamentos` (nova)
- `id` - UUID primary key
- `numero_cliente` - número do cliente
- `tipo` - 'divida' ou 'financiamento'
- `descricao` - descrição da dívida/financiamento
- `valor_total` - valor total
- `valor_pago` - valor já pago
- `data_inicio` - data de início
- `data_vencimento` - data de vencimento
- `parcelas_total` - número total de parcelas (opcional)
- `parcelas_pagas` - número de parcelas pagas (opcional)
- `taxa_juros` - taxa de juros em % (opcional)
- `criado_em` - timestamp de criação
- `atualizado_em` - timestamp de atualização

## Funcionalidades Implementadas

### ✅ Status de Pagamento
- Transações podem ser marcadas como "Pago" ou "A Pagar"
- Filtros para visualizar apenas transações pagas ou a pagar
- Indicador visual de status

### ✅ Dívidas
- Cadastro de dívidas
- Acompanhamento de valor pago vs valor total
- Barra de progresso visual
- Data de vencimento

### ✅ Financiamentos
- Cadastro de financiamentos
- Controle de parcelas (pagas/total)
- Taxa de juros
- Barra de progresso visual
- Cálculo automático de valor restante

## Resumo da Implementação

### Passo 1: Adicionar coluna status
```sql
ALTER TABLE financeiro_clientes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pago';
```

### Passo 2: Criar tabela de dívidas
```sql
-- Execute o CREATE TABLE acima
```

### Passo 3: Configurar RLS
```sql
-- Execute as políticas de segurança acima
```

### Passo 4: Criar triggers
```sql
-- Execute a função e trigger de timestamp acima
```

## Resultado Final

✅ **Transações**: Agora com status "Pago" ou "A Pagar"  
✅ **Dívidas**: Controle completo de dívidas pessoais  
✅ **Financiamentos**: Gestão de financiamentos com parcelas  
✅ **Progresso Visual**: Barras de progresso para acompanhamento  
✅ **Segurança**: RLS configurado para proteção de dados
