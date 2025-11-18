# Migração Supabase - Categorias

## Adicionar coluna `is_default` na tabela `categorias_clientes`

Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Adicionar coluna is_default
ALTER TABLE categorias_clientes 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Atualizar categorias existentes como não-padrão
UPDATE categorias_clientes 
SET is_default = false 
WHERE is_default IS NULL;

-- Opcional: Se quiser marcar categorias existentes específicas como padrão
-- UPDATE categorias_clientes 
-- SET is_default = true 
-- WHERE name IN ('Alimentação', 'Transporte', 'Casa', 'Saúde', 'Educação', 'Lazer', 'Utilidades', 'Outros', 'Salário', 'Freelance', 'Investimentos', 'Reembolsos');
```

## Estrutura da tabela `categorias_clientes`

Após a migração, a tabela deve ter:

- `id` (uuid, primary key)
- `session_id` (text) - número do cliente
- `name` (text) - nome da categoria
- `type` (text) - 'receita' ou 'despesa'
- `is_default` (boolean) - true para categorias padrão, false para personalizadas
- `created_at` (timestamp)

## Comportamento

- **Categorias Padrão** (`is_default = true`):
  - Criadas automaticamente no primeiro acesso
  - Não podem ser deletadas pelo usuário
  - Aparecem com badge "Padrão" na interface

- **Categorias Personalizadas** (`is_default = false`):
  - Criadas pelo usuário
  - Podem ser deletadas
  - Aparecem sem badge

---

## Trigger: Criar Categorias Padrão Automaticamente

Quando um novo cliente for adicionado na tabela `clientes_meu_auxiliar`, o sistema deve criar automaticamente todas as categorias padrão para ele.

Execute o seguinte SQL no Supabase SQL Editor:

```sql
-- Função que cria categorias padrão para um novo cliente
CREATE OR REPLACE FUNCTION criar_categorias_padrao()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir categorias de RECEITA
  INSERT INTO categorias_clientes (session_id, name, type, is_default)
  VALUES
    (NEW.numero_cliente, 'Salário', 'receita', true),
    (NEW.numero_cliente, 'Freelance', 'receita', true),
    (NEW.numero_cliente, 'Investimentos', 'receita', true),
    (NEW.numero_cliente, 'Reembolsos', 'receita', true),
    (NEW.numero_cliente, 'Outros', 'receita', true);
  
  -- Inserir categorias de DESPESA
  INSERT INTO categorias_clientes (session_id, name, type, is_default)
  VALUES
    (NEW.numero_cliente, 'Alimentação', 'despesa', true),
    (NEW.numero_cliente, 'Transporte', 'despesa', true),
    (NEW.numero_cliente, 'Casa', 'despesa', true),
    (NEW.numero_cliente, 'Saúde', 'despesa', true),
    (NEW.numero_cliente, 'Educação', 'despesa', true),
    (NEW.numero_cliente, 'Lazer', 'despesa', true),
    (NEW.numero_cliente, 'Utilidades', 'despesa', true),
    (NEW.numero_cliente, 'Outros', 'despesa', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que executa após inserir novo cliente
DROP TRIGGER IF EXISTS trigger_criar_categorias_padrao ON clientes_meu_auxiliar;

CREATE TRIGGER trigger_criar_categorias_padrao
AFTER INSERT ON clientes_meu_auxiliar
FOR EACH ROW
EXECUTE FUNCTION criar_categorias_padrao();
```

### Como funciona:

1. **Quando um novo cliente é inserido** na tabela `clientes_meu_auxiliar`
2. O trigger `trigger_criar_categorias_padrao` é acionado automaticamente
3. A função `criar_categorias_padrao()` insere 13 categorias padrão:
   - 5 categorias de **receita**
   - 8 categorias de **despesa**
4. Todas marcadas com `is_default = true`
5. Vinculadas ao `numero_cliente` do novo cliente

### Vantagens:

- ✅ Automático - não precisa código no frontend
- ✅ Garantido - todo cliente novo já tem categorias
- ✅ Consistente - sempre as mesmas categorias padrão
- ✅ Performance - executa no banco de dados

---

## Script: Adicionar Categorias para Clientes Existentes

Se você já tem clientes cadastrados e quer adicionar as categorias padrão para eles, execute este script:

```sql
-- Script para adicionar categorias padrão aos clientes existentes
DO $$
DECLARE
  cliente RECORD;
BEGIN
  -- Loop por todos os clientes
  FOR cliente IN SELECT numero_cliente FROM clientes_meu_auxiliar
  LOOP
    -- Verificar se o cliente já tem categorias
    IF NOT EXISTS (
      SELECT 1 FROM categorias_clientes 
      WHERE session_id = cliente.numero_cliente
    ) THEN
      -- Inserir categorias de RECEITA
      INSERT INTO categorias_clientes (session_id, name, type, is_default)
      VALUES
        (cliente.numero_cliente, 'Salário', 'receita', true),
        (cliente.numero_cliente, 'Freelance', 'receita', true),
        (cliente.numero_cliente, 'Investimentos', 'receita', true),
        (cliente.numero_cliente, 'Reembolsos', 'receita', true),
        (cliente.numero_cliente, 'Outros', 'receita', true);
      
      -- Inserir categorias de DESPESA
      INSERT INTO categorias_clientes (session_id, name, type, is_default)
      VALUES
        (cliente.numero_cliente, 'Alimentação', 'despesa', true),
        (cliente.numero_cliente, 'Transporte', 'despesa', true),
        (cliente.numero_cliente, 'Casa', 'despesa', true),
        (cliente.numero_cliente, 'Saúde', 'despesa', true),
        (cliente.numero_cliente, 'Educação', 'despesa', true),
        (cliente.numero_cliente, 'Lazer', 'despesa', true),
        (cliente.numero_cliente, 'Utilidades', 'despesa', true),
        (cliente.numero_cliente, 'Outros', 'despesa', true);
      
      RAISE NOTICE 'Categorias criadas para cliente: %', cliente.numero_cliente;
    END IF;
  END LOOP;
END $$;
```

Este script:
- Percorre todos os clientes existentes
- Verifica se já tem categorias
- Se não tiver, cria as 13 categorias padrão
- Exibe mensagem de confirmação para cada cliente

---

## Resumo da Implementação

### Passo 1: Adicionar coluna `is_default`
```sql
ALTER TABLE categorias_clientes 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
```

### Passo 2: Criar trigger para novos clientes
```sql
-- Copie e execute toda a função e trigger acima
```

### Passo 3: Adicionar categorias aos clientes existentes
```sql
-- Execute o script DO $$ ... END $$; acima
```

### Resultado Final:

✅ **Novos clientes**: Recebem automaticamente 13 categorias padrão  
✅ **Clientes existentes**: Recebem categorias ao executar o script  
✅ **Interface**: Mostra categorias padrão + personalizadas  
✅ **Proteção**: Categorias padrão não podem ser deletadas  

### Categorias Criadas Automaticamente:

**Receitas (5):**
- Salário
- Freelance
- Investimentos
- Reembolsos
- Outros

**Despesas (8):**
- Alimentação
- Transporte
- Casa
- Saúde
- Educação
- Lazer
- Utilidades
- Outros
