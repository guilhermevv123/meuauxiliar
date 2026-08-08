# Diamond Lembretes — imagem de produção.
#
# Duas etapas: a primeira compila o SPA, a segunda só serve os arquivos
# estáticos. A imagem final não leva Node nem node_modules — fica na casa dos
# 50 MB em vez de ~1 GB, e o que não está lá dentro não pode ser explorado.
#
# O app é 100% estático: todo segredo (chave da OpenAI, service_role) vive nas
# Edge Functions do Supabase, NUNCA aqui. Por isso não existe ARG/ENV de chave
# neste Dockerfile — se um dia aparecer um, é sinal de que algo regrediu.

# ── build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Só os manifests primeiro: enquanto as dependências não mudam, o Docker
# reaproveita a camada do npm ci e o build fica em segundos.
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ── runtime ───────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# nginx:alpine já roda o master como root e os workers como nginx; a porta 80
# interna é padrão e você mapeia pra onde quiser (-p 8080:80).
EXPOSE 80

# 127.0.0.1 explícito, NUNCA "localhost": dentro do container o localhost
# resolve também para ::1, e o busybox wget tenta o IPv6 primeiro. Como o
# nginx só escutava IPv4, o check tomava "connection refused", o Docker
# marcava unhealthy e o orquestrador (Swarm do EasyPanel) matava o container
# ~67s depois de subir — parecia erro de build, era o healthcheck.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
