-- Etiquetas coloridas + avisos antecipados.
--
-- Duas decisões que valem registro:
--
-- 1. **`etiqueta_ids uuid[]` em vez de tabela de junção.** O app é
--    offline-first: a fila de sincronização (src/lib/offline.ts) sabe repetir
--    UMA operação por linha (upsert/delete). Uma junção N:N exigiria a fila
--    coordenar duas tabelas por gravação, com ordem e rollback — complexidade
--    real para um app pessoal de dezenas de linhas. Array mantém a gravação
--    atômica e a sincronização trivial.
--
-- 2. **`avisos int[]` + `avisos_enviados int[]`** em vez de um único
--    "avisar_antes". O pedido era avisar no dia E perto de vencer — ou seja,
--    vários disparos para o MESMO item. Guardar quais já foram é o que impede
--    o cron (roda a cada minuto) de repetir o mesmo aviso 60x por hora.

-- ── Etiquetas ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.etiquetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  cor text NOT NULL DEFAULT 'azul',
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- Mesma etiqueta duas vezes só confunde na hora de escolher.
CREATE UNIQUE INDEX IF NOT EXISTS etiquetas_nome_por_dono
  ON public.etiquetas (user_id, lower(nome));

ALTER TABLE public.etiquetas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS etiquetas_dono ON public.etiquetas;
CREATE POLICY etiquetas_dono ON public.etiquetas FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
REVOKE ALL ON public.etiquetas FROM anon;

-- ── Vínculo com notas e lembretes ────────────────────────────────────
ALTER TABLE public.notas
  ADD COLUMN IF NOT EXISTS etiqueta_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.lembretes
  ADD COLUMN IF NOT EXISTS etiqueta_ids uuid[] NOT NULL DEFAULT '{}';
ALTER TABLE public.compromissos
  ADD COLUMN IF NOT EXISTS etiqueta_ids uuid[] NOT NULL DEFAULT '{}';

-- GIN: filtrar "notas com a etiqueta X" sem varrer a tabela.
CREATE INDEX IF NOT EXISTS notas_etiquetas_gin
  ON public.notas USING gin (etiqueta_ids);
CREATE INDEX IF NOT EXISTS lembretes_etiquetas_gin
  ON public.lembretes USING gin (etiqueta_ids);

-- ── Avisos antecipados ───────────────────────────────────────────────
-- Minutos ANTES do horário. 0 = na hora, 60 = 1h antes, 1440 = 1 dia antes.
ALTER TABLE public.lembretes
  ADD COLUMN IF NOT EXISTS avisos int[] NOT NULL DEFAULT '{0}',
  ADD COLUMN IF NOT EXISTS avisos_enviados int[] NOT NULL DEFAULT '{}';

-- Compromissos passam a notificar também — antes a agenda era muda.
ALTER TABLE public.compromissos
  ADD COLUMN IF NOT EXISTS avisos int[] NOT NULL DEFAULT '{60}',
  ADD COLUMN IF NOT EXISTS avisos_enviados int[] NOT NULL DEFAULT '{}';

-- O carteiro busca por horário; sem índice ele varre tudo a cada minuto.
CREATE INDEX IF NOT EXISTS lembretes_quando_idx
  ON public.lembretes (quando) WHERE concluido = false;
CREATE INDEX IF NOT EXISTS compromissos_inicio_idx
  ON public.compromissos (inicio);
