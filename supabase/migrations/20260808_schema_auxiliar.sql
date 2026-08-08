-- =====================================================================
-- MEU AUXILIAR — schema completo (compromissos, notas, lembretes, IA, push)
--
-- Regras que valem para TODAS as tabelas:
--  • `user_id` referencia auth.users com ON DELETE CASCADE: apagar a conta
--    apaga os dados — este app é pessoal, não há "transferir para colega".
--  • RLS ligada DESDE A CRIAÇÃO com política user_id = auth.uid() nas quatro
--    operações. Duas pessoas usam o mesmo banco (dono + amigo); sem isso um
--    veria os compromissos do outro com um select no console.
--  • Nomes em português: o app fala português, o banco acompanha.
-- =====================================================================

-- Perfil espelho do auth.users (nome exibido no app e usado pela IA)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       text,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

-- Trigger: toda conta nova ganha perfil sem o app precisar lembrar de criar.
CREATE OR REPLACE FUNCTION public.fn_novo_usuario()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS trg_novo_usuario ON auth.users;
CREATE TRIGGER trg_novo_usuario AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.fn_novo_usuario();

-- Compromissos (agenda)
CREATE TABLE IF NOT EXISTS public.compromissos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo        text NOT NULL,
  descricao     text,
  local         text,
  inicio        timestamptz NOT NULL,
  fim           timestamptz,
  dia_inteiro   boolean NOT NULL DEFAULT false,
  cor           text NOT NULL DEFAULT 'sky',
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT compromissos_fim_chk CHECK (fim IS NULL OR fim >= inicio)
);
CREATE INDEX IF NOT EXISTS idx_compromissos_user_inicio
  ON public.compromissos (user_id, inicio);

-- Notas
CREATE TABLE IF NOT EXISTS public.notas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo        text NOT NULL DEFAULT '',
  conteudo      text NOT NULL DEFAULT '',
  fixada        boolean NOT NULL DEFAULT false,
  cor           text NOT NULL DEFAULT 'padrao',
  criado_em     timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notas_user_atualizada
  ON public.notas (user_id, fixada DESC, atualizado_em DESC);

-- Lembretes (o que dispara notificação push)
CREATE TABLE IF NOT EXISTS public.lembretes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo        text NOT NULL,
  quando        timestamptz NOT NULL,
  repetir       text NOT NULL DEFAULT 'nunca'
                CHECK (repetir IN ('nunca','diario','semanal','mensal')),
  concluido     boolean NOT NULL DEFAULT false,
  -- carimbo de "push já enviado" — é o que impede o cron de notificar duas
  -- vezes o mesmo vencimento. Lembrete repetido: o cron reagenda `quando`
  -- para a próxima ocorrência e zera este campo.
  notificado_em timestamptz,
  criado_em     timestamptz NOT NULL DEFAULT now()
);
-- Índice do cron: só o que está pendente de disparo.
CREATE INDEX IF NOT EXISTS idx_lembretes_pendentes
  ON public.lembretes (quando)
  WHERE NOT concluido AND notificado_em IS NULL;
CREATE INDEX IF NOT EXISTS idx_lembretes_user
  ON public.lembretes (user_id, quando);

-- Inscrições de push (uma por navegador/aparelho)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text NOT NULL UNIQUE,
  p256dh     text NOT NULL,
  auth       text NOT NULL,
  criado_em  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_push_user ON public.push_subscriptions (user_id);

-- Histórico do chat com a IA (memória entre sessões e entre aparelhos)
CREATE TABLE IF NOT EXISTS public.ai_mensagens (
  id         bigserial PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  papel      text NOT NULL CHECK (papel IN ('user','assistant')),
  conteudo   text NOT NULL,
  criado_em  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_msgs_user ON public.ai_mensagens (user_id, id DESC);

-- ── RLS: cada um enxerga SÓ o que é seu ──────────────────────────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['compromissos','notas','lembretes','push_subscriptions','ai_mensagens']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_dono ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_dono ON public.%I FOR ALL TO authenticated
         USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())', t, t);
  END LOOP;
END $$;

-- profiles: cada um lê/edita só o próprio (a IA lê via service_role)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS profiles_dono ON public.profiles;
CREATE POLICY profiles_dono ON public.profiles FOR ALL TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- anon não lê NADA (login é obrigatório pra tudo)
REVOKE ALL ON public.compromissos, public.notas, public.lembretes,
           public.push_subscriptions, public.ai_mensagens, public.profiles FROM anon;

-- `atualizado_em` automático
CREATE OR REPLACE FUNCTION public.fn_toque_atualizado()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.atualizado_em = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_compromissos_touch ON public.compromissos;
CREATE TRIGGER trg_compromissos_touch BEFORE UPDATE ON public.compromissos
  FOR EACH ROW EXECUTE FUNCTION public.fn_toque_atualizado();
DROP TRIGGER IF EXISTS trg_notas_touch ON public.notas;
CREATE TRIGGER trg_notas_touch BEFORE UPDATE ON public.notas
  FOR EACH ROW EXECUTE FUNCTION public.fn_toque_atualizado();

-- Extensões do disparo de push agendado (cron chama a edge function via HTTP)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
