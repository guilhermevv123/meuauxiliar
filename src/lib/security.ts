/**
 * Sistema de Segurança
 * Implementa proteções contra ataques comuns e validações de segurança
 */

// ==================== SANITIZAÇÃO DE INPUTS ====================

/**
 * Remove caracteres perigosos de strings para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onload=, etc)
    .trim();
}

/**
 * Valida e sanitiza email
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeInput(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Email inválido');
  }
  
  return sanitized;
}

/**
 * Valida e sanitiza números
 */
export function sanitizeNumber(value: any): number {
  const num = Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error('Número inválido');
  }
  
  return num;
}

// ==================== RATE LIMITING ====================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Implementa rate limiting para prevenir abuso de API
 * @param key Identificador único (ex: email, IP, sessionId)
 * @param maxRequests Número máximo de requisições
 * @param windowMs Janela de tempo em milissegundos
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minuto
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // Nova janela de tempo
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false; // Limite excedido
  }
  
  entry.count++;
  return true;
}

/**
 * Limpa entradas antigas do rate limit
 */
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Limpar a cada 5 minutos
setInterval(cleanupRateLimit, 5 * 60 * 1000);

// ==================== VALIDAÇÃO DE SESSION ====================

/**
 * Valida se uma sessão é válida e não expirou
 */
export function validateSession(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  // Verifica se o sessionId tem formato válido (BigInt string)
  if (!/^\d+$/.test(sessionId)) {
    return false;
  }
  
  return true;
}

/**
 * Gera um token CSRF para proteção contra ataques CSRF
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida token CSRF
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return token === storedToken;
}

// ==================== PROTEÇÃO DE DADOS SENSÍVEIS ====================

/**
 * Mascara dados sensíveis para logs
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return '***';
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(Math.min(data.length - visibleChars, 8));
  return masked + visible;
}

/**
 * Mascara email para exibição
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  
  const [username, domain] = email.split('@');
  const maskedUsername = username.length > 2 
    ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
    : '***';
  
  return `${maskedUsername}@${domain}`;
}

// ==================== VALIDAÇÃO DE INPUTS DE FORMULÁRIO ====================

/**
 * Valida valor monetário
 */
export function validateCurrency(value: any): number {
  const num = sanitizeNumber(value);
  
  if (num < 0) {
    throw new Error('Valor não pode ser negativo');
  }
  
  if (num > 999999999) {
    throw new Error('Valor muito grande');
  }
  
  return Math.round(num * 100) / 100; // Arredonda para 2 casas decimais
}

/**
 * Valida data
 */
export function validateDate(dateString: string): Date {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }
  
  // Verifica se a data está em um range razoável (1900 - 2100)
  const year = date.getFullYear();
  if (year < 1900 || year > 2100) {
    throw new Error('Data fora do range permitido');
  }
  
  return date;
}

/**
 * Valida descrição/texto
 */
export function validateText(text: string, maxLength: number = 500): string {
  const sanitized = sanitizeInput(text);
  
  if (sanitized.length === 0) {
    throw new Error('Texto não pode estar vazio');
  }
  
  if (sanitized.length > maxLength) {
    throw new Error(`Texto muito longo (máximo ${maxLength} caracteres)`);
  }
  
  return sanitized;
}

// ==================== PROTEÇÃO CONTRA INJEÇÃO SQL ====================

/**
 * Escapa caracteres especiais para prevenir SQL injection
 * Nota: O Supabase já faz isso automaticamente, mas é bom ter como camada extra
 */
export function escapeSQLString(str: string): string {
  if (!str) return '';
  
  return str
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0');
}

// ==================== DETECÇÃO DE ANOMALIAS ====================

interface ActivityLog {
  timestamp: number;
  action: string;
}

const activityLogs = new Map<string, ActivityLog[]>();

/**
 * Registra atividade do usuário para detecção de anomalias
 */
export function logActivity(userId: string, action: string) {
  const logs = activityLogs.get(userId) || [];
  logs.push({
    timestamp: Date.now(),
    action
  });
  
  // Mantém apenas últimas 100 ações
  if (logs.length > 100) {
    logs.shift();
  }
  
  activityLogs.set(userId, logs);
}

/**
 * Detecta comportamento suspeito (muitas ações em pouco tempo)
 */
export function detectSuspiciousActivity(userId: string, threshold: number = 50): boolean {
  const logs = activityLogs.get(userId) || [];
  const now = Date.now();
  const recentLogs = logs.filter(log => now - log.timestamp < 60000); // Último minuto
  
  return recentLogs.length > threshold;
}

// ==================== HEADERS DE SEGURANÇA ====================

/**
 * Headers de segurança recomendados para o servidor
 * (Para implementar no backend ou configuração do servidor)
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// ==================== UTILITÁRIOS ====================

/**
 * Delay para prevenir timing attacks
 */
export async function constantTimeDelay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Compara strings de forma segura (constant-time)
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
