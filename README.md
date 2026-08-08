# Meu Auxiliar

Organizador pessoal com assistente de IA por voz, no visual do Diamond CRM.
**No ar em [meuauxiliar.com](https://meuauxiliar.com)** — instala como app no
celular (Compartilhar → Adicionar à Tela de Início).

## O que faz

- **Agenda** — calendário mensal + compromissos com hora, local e cor
- **Notas** — anotações com busca e fixar
- **Lembretes** — com repetição (diário/semanal/mensal) e **notificação push**
  na hora marcada, mesmo com o app fechado
- **Assistente** — chat com IA que **cria e consulta** tudo isso por você.
  Fale com ela: toque no microfone, peça "marca dentista sexta às 14h", e ela
  marca — e responde **em voz alta** (voz "coral", a mesma do assistente de
  mesa Diamond)
- **Login** individual — cada pessoa vê só o que é seu (RLS no banco)

## Arquitetura

| Peça | Onde | Por quê |
|---|---|---|
| Front (este repo) | GitHub Pages + CNAME | push na `main` = site publicado |
| Banco + Auth | Supabase (`zxaiearxsuulhkfyybke`) | RLS por usuário em toda tabela |
| IA / Voz / Push | Supabase Edge Functions (`ai-chat`, `voz`, `push-lembretes`) | a chave da OpenAI **nunca** vai ao navegador |
| Disparo de lembrete | `pg_cron` a cada minuto → `pg_net` → `push-lembretes` | push chega sem nenhum servidor próprio |

### Segurança — o que não pode regredir

1. **Nenhuma chave privada no front.** O bundle só carrega URL + chave `anon`
   do Supabase (públicas por desenho). A versão antiga deste app publicava a
   chave da OpenAI dentro do JavaScript — foi removida; **revogue a chave
   antiga** no painel da OpenAI.
2. **RLS em todas as tabelas** (`compromissos`, `notas`, `lembretes`,
   `push_subscriptions`, `ai_mensagens`, `profiles`): política
   `user_id = auth.uid()` nas quatro operações.
3. **A IA opera com o JWT do usuário** — as ferramentas dela passam pela RLS
   como qualquer request; ela não alcança dados de outra conta nem por engano
   de prompt.
4. **`push-lembretes`** roda sem JWT (é chamada pelo cron) mas exige o header
   `x-cron-secret`.

## Desenvolvimento

```bash
npm install
npm run dev        # front local (aponta pro Supabase de produção)
npm run build      # build de produção

# edge functions (precisa de SUPABASE_ACCESS_TOKEN)
supabase functions deploy ai-chat --project-ref zxaiearxsuulhkfyybke
supabase functions deploy voz --project-ref zxaiearxsuulhkfyybke
supabase functions deploy push-lembretes --no-verify-jwt --project-ref zxaiearxsuulhkfyybke
```

Migrations do banco em `supabase/migrations/`. Segredos das functions
(`OPENAI_API_KEY`, `VAPID_KEYS_JWK`, `CRON_SECRET`): `supabase secrets set`.

## Notificações no iPhone

Push de site no iOS só funciona **instalado**: Safari → Compartilhar →
Adicionar à Tela de Início → abrir pelo ícone → menu do avatar → Ativar
notificações. (iOS 16.4+)
