# 🚀 Belvo Backend para VPS

Backend Node.js/Express para integração Open Finance com Belvo.

## 📋 Pré-requisitos

- Node.js 16+ instalado na VPS
- Conta Belvo (https://dashboard.belvo.com)
- PM2 para process management (opcional mas recomendado)

## 🔧 Configuração na VPS

### 1. Copie os arquivos para sua VPS

```bash
scp -r belvo-backend/ usuario@seu-vps-ip:/home/usuario/
```

### 2. Conecte na VPS e instale dependências

```bash
ssh usuario@seu-vps-ip
cd /home/usuario/belvo-backend
npm install
```

### 3. Configure as variáveis de ambiente

Crie arquivo `.env`:

```bash
nano .env
```

Cole:

```env
# Belvo Credentials (obtenha em https://dashboard.belvo.com)
BELVO_SECRET_ID=sua_secret_id_aqui
BELVO_SECRET_PASSWORD=sua_secret_password_aqui

# Server Config
PORT=3001
NODE_ENV=production

# Frontend URL (configure para seu domínio GitHub Pages)
FRONTEND_URL=https://seu-usuario.github.io
```

### 4. Instale PM2 (gerenciador de processos)

```bash
npm install -g pm2
```

### 5. Inicie o servidor

```bash
pm2 start index.js --name belvo-backend
pm2 save
pm2 startup
```

### 6. Configure Nginx como proxy reverso (opcional)

```nginx
server {
    listen 80;
    server_name api.seudominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🌐 Configurar no Frontend

No arquivo `.env` do projeto principal, adicione:

```env
VITE_BELVO_BACKEND_URL=http://seu-vps-ip:3001
# OU se configurou domínio:
VITE_BELVO_BACKEND_URL=https://api.seudominio.com
```

## 📝 Endpoints Disponíveis

### Health Check

```bash
GET http://seu-vps-ip:3001/
```

### Widget Token (usado pelo frontend)

```bash
POST http://seu-vps-ip:3001/api/belvo/widget-token
```

### Buscar Transações

```bash
POST http://seu-vps-ip:3001/api/belvo/transactions
Content-Type: application/json

{
  "link_id": "id_do_link",
  "date_from": "2024-01-01",
  "date_to": "2024-12-31"
}
```

## 🔒 Segurança

1. **Firewall**: Abra apenas a porta necessária

```bash
sudo ufw allow 3001/tcp
sudo ufw enable
```

2. **HTTPS**: Use Certbot para SSL

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.seudominio.com
```

3. **Rate Limiting**: Adicione rate limiting no Nginx ou Express

## 📊 Monitoramento

### Ver logs em tempo real:

```bash
pm2 logs belvo-backend
```

### Status do serviço:

```bash
pm2 status
```

### Reiniciar:

```bash
pm2 restart belvo-backend
```

## 🆓 Plano Gratuito Belvo

- ✅ Sandbox ilimitado
- ✅ 25 links de dados reais
- ✅ Acesso a +60 instituições brasileiras
- ✅ Quando crescer: R$ 6.000/mês (plano Launch)

## 🧪 Testar Localmente

1. Instale dependências:

```bash
cd belvo-backend
npm install
```

2. Configure `.env` com suas credenciais Belvo

3. Rode:

```bash
node index.js
```

4. Teste:

```bash
curl http://localhost:3001/
```

## ❓ Troubleshooting

**Erro de autenticação:**

- Verifique se `BELVO_SECRET_ID` e `BELVO_SECRET_PASSWORD` estão corretos
- Confirme no dashboard Belvo: https://dashboard.belvo.com

**CORS error:**

- Configure `FRONTEND_URL` no `.env` com o domínio correto

**Porta em uso:**

- Mude a `PORT` no `.env`

---

**Desenvolvido para:** Meu Auxiliar  
**Provedor:** Belvo Open Finance  
**Plataforma:** Node.js + Express
