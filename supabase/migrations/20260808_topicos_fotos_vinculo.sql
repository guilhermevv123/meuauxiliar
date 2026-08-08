-- =====================================================================
-- Notas com tópicos + fotos em notas/lembretes + vínculo lembrete→nota
--
--  • `notas.topicos`  — lista de bullets (jsonb array de strings). O título
--    continua em `titulo`; o corpo livre continua em `conteudo`. Tópicos são
--    o formato estruturado que o dono pediu ("título e o tópico").
--  • `foto_url` em notas E lembretes — caminho no Storage (bucket privado).
--  • `lembretes.nota_id` — um lembrete pode apontar para uma nota (ON DELETE
--    SET NULL: apagar a nota não apaga o lembrete, só desfaz o vínculo).
-- =====================================================================

ALTER TABLE public.notas
  ADD COLUMN IF NOT EXISTS topicos  jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS foto_url text;

ALTER TABLE public.lembretes
  ADD COLUMN IF NOT EXISTS foto_url text,
  ADD COLUMN IF NOT EXISTS nota_id  uuid REFERENCES public.notas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lembretes_nota ON public.lembretes (nota_id) WHERE nota_id IS NOT NULL;
