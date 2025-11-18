# 🔒 Guia de Segurança - Meu Auxiliar Premium

## Visão Geral

Este documento descreve as medidas de segurança implementadas no sistema e as melhores práticas para manter a aplicação segura.

## 🛡️ Medidas de Segurança Implementadas

### 1. Autenticação e Sessão

#### ✅ Validação de Sessão
- Validação automática de formato do `sessionId`
- Verificação de expiração de sessão (24 horas)
- Timeout por inatividade (2 horas)
- Renovação automática de sessão em atividades

#### ✅ Proteção de Dados de Sessão
- Mascaramento de emails em logs
- Ocultação parcial de sessionId em logs
- Limpeza automática de sessões expiradas

### 2. Proteção contra Ataques Comuns

#### ✅ XSS (Cross-Site Scripting)
- Sanitização de todos os inputs do usuário
- Remoção de tags HTML perigosas (`<script>`, `<iframe>`, etc)
- Remoção de event handlers (`onclick`, `onload`, etc)
- Remoção de protocolos perigosos (`javascript:`, `data:`, etc)

#### ✅ SQL Injection
- Uso do Supabase que já protege contra SQL injection
- Camada adicional de escape de caracteres especiais
- Validação de tipos de dados antes de queries

#### ✅ CSRF (Cross-Site Request Forgery)
- Geração de tokens CSRF únicos
- Validação de tokens em operações sensíveis
- Tokens com tempo de expiração

### 3. Rate Limiting

#### ✅ Proteção contra Abuso de API
- Limite de 100 requisições por minuto por usuário
- Bloqueio temporário após exceder o limite
- Limpeza automática de registros antigos
- Mensagens claras ao usuário sobre limites

### 4. Validação de Dados

#### ✅ Validação de Inputs
- **Email**: Formato válido, sanitização, lowercase
- **Números**: Validação de NaN, Infinity, ranges
- **Datas**: Validação de formato e range (1900-2100)
- **Texto**: Limite de caracteres, remoção de conteúdo perigoso
- **Valores Monetários**: Validação de negativos, limite máximo, arredondamento

### 5. Detecção de Anomalias

#### ✅ Monitoramento de Atividade
- Log de todas as ações do usuário
- Detecção de comportamento suspeito (muitas ações em pouco tempo)
- Desconexão automática em caso de atividade anômala
- Limite de tentativas de acesso não autorizado

### 6. Proteção de Dados Sensíveis

#### ✅ Mascaramento de Dados
- Emails mascarados em logs e exibições
- Dados sensíveis parcialmente ocultos
- Logs seguros sem exposição de informações críticas

## 🔧 Como Usar os Recursos de Segurança

### Usando o Hook `useSecurity`

```typescript
import { useSecurity } from '@/hooks/useSecurity';

function MyComponent() {
  const { withRateLimit, sanitize, logout } = useSecurity();
  
  const handleSubmit = async (data: any) => {
    // Executa com proteção de rate limiting
    await withRateLimit(async () => {
      // Sua lógica aqui
      const sanitizedData = sanitize(data.text);
      // ...
    }, 'submit_form', 50); // 50 requisições por minuto
  };
  
  return (
    <button onClick={handleSubmit}>Enviar</button>
  );
}
```

### Usando o Hook `useSecureForm`

```typescript
import { useSecureForm } from '@/hooks/useSecurity';

function MyForm() {
  const { sanitizeFormData } = useSecureForm();
  
  const onSubmit = (data: FormData) => {
    const sanitized = sanitizeFormData(data);
    // Dados agora estão sanitizados
  };
}
```

### Validando Dados Manualmente

```typescript
import { 
  validateCurrency, 
  validateDate, 
  validateText,
  sanitizeEmail 
} from '@/lib/security';

try {
  const email = sanitizeEmail(userInput.email);
  const amount = validateCurrency(userInput.amount);
  const date = validateDate(userInput.date);
  const description = validateText(userInput.description, 200);
} catch (error) {
  console.error('Validação falhou:', error.message);
}
```

## 🚨 Alertas de Segurança

O sistema exibe alertas automáticos para:

- ✅ Sessão expirada
- ✅ Atividade suspeita detectada
- ✅ Limite de requisições excedido
- ✅ Tentativas de acesso não autorizado
- ✅ Dados inválidos

## 📋 Checklist de Segurança para Desenvolvedores

Ao adicionar novas funcionalidades, sempre:

- [ ] Sanitizar todos os inputs do usuário
- [ ] Validar tipos de dados antes de usar
- [ ] Usar `withRateLimit` para ações sensíveis
- [ ] Verificar sessão antes de operações críticas
- [ ] Não expor dados sensíveis em logs
- [ ] Tratar erros adequadamente sem expor detalhes internos
- [ ] Testar com dados maliciosos (XSS, SQL injection)
- [ ] Implementar validação no frontend E backend

## 🔐 Headers de Segurança Recomendados

Configure seu servidor/CDN com os seguintes headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 🔄 Timeouts e Limites

| Recurso | Limite | Descrição |
|---------|--------|-----------|
| Sessão Total | 24 horas | Tempo máximo de uma sessão |
| Inatividade | 2 horas | Tempo sem atividade antes de expirar |
| Rate Limit | 100/min | Requisições por minuto por usuário |
| Tentativas de Acesso | 5 | Tentativas não autorizadas antes de bloqueio |
| Tamanho de Texto | 500 chars | Limite padrão para campos de texto |
| Valor Monetário | 999.999.999 | Valor máximo permitido |

## 🐛 Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Entre em contato diretamente com a equipe de desenvolvimento
3. Forneça detalhes sobre a vulnerabilidade
4. Aguarde resposta antes de divulgar publicamente

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Web Security Academy](https://portswigger.net/web-security)

## 🔄 Atualizações

Este documento é atualizado regularmente. Última atualização: Novembro 2025

---

**Lembre-se**: Segurança é um processo contínuo, não um estado final. Mantenha-se atualizado sobre novas ameaças e melhores práticas.
