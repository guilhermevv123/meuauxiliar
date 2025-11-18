import { validateSession, sanitizeEmail, maskEmail } from './security';

export type AppSession = { 
  email: string; 
  sessionId: string;
  createdAt: number;
  lastActivity: number;
};

const KEY = "app_session";
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 horas
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 horas

/**
 * Obtém a sessão atual com validação de segurança
 */
export function getSession(): AppSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    
    const session = JSON.parse(raw) as AppSession;
    
    // Validações de segurança
    if (!session.sessionId || !validateSession(session.sessionId)) {
      console.warn("⚠️ Sessão inválida detectada");
      clearSession();
      return null;
    }
    
    // Verifica timeout da sessão
    const now = Date.now();
    if (session.createdAt && (now - session.createdAt > SESSION_TIMEOUT)) {
      console.warn("⚠️ Sessão expirada (timeout)");
      clearSession();
      return null;
    }
    
    // Verifica inatividade
    if (session.lastActivity && (now - session.lastActivity > INACTIVITY_TIMEOUT)) {
      console.warn("⚠️ Sessão expirada (inatividade)");
      clearSession();
      return null;
    }
    
    // Atualiza última atividade
    session.lastActivity = now;
    localStorage.setItem(KEY, JSON.stringify(session));
    
    console.log("🔑 getSession:", { 
      email: maskEmail(session.email), 
      sessionId: session.sessionId.slice(-8) 
    });
    
    return session;
  } catch (error) {
    console.error("❌ Erro ao obter sessão:", error);
    clearSession();
    return null;
  }
}

/**
 * Define uma nova sessão com validações de segurança
 */
export function setSession(s: AppSession) {
  try {
    // Valida email
    const sanitizedEmail = sanitizeEmail(s.email);
    
    // Valida sessionId
    if (!validateSession(s.sessionId)) {
      throw new Error("SessionId inválido");
    }
    
    const now = Date.now();
    const session: AppSession = {
      email: sanitizedEmail,
      sessionId: s.sessionId,
      createdAt: s.createdAt || now,
      lastActivity: now
    };
    
    localStorage.setItem(KEY, JSON.stringify(session));
    
    console.log("💾 setSession:", { 
      email: maskEmail(session.email), 
      sessionId: session.sessionId.slice(-8),
      createdAt: new Date(session.createdAt).toISOString()
    });
  } catch (error) {
    console.error("❌ Erro ao definir sessão:", error);
    throw error;
  }
}

/**
 * Limpa a sessão atual
 */
export function clearSession() {
  try {
    localStorage.removeItem(KEY);
    console.log("🗑️ Sessão limpa");
  } catch (error) {
    console.error("❌ Erro ao limpar sessão:", error);
  }
}

/**
 * Verifica se há uma sessão válida
 */
export function hasValidSession(): boolean {
  return getSession() !== null;
}

/**
 * Renova a sessão (atualiza timestamps)
 */
export function renewSession(): boolean {
  const session = getSession();
  if (!session) return false;
  
  setSession(session);
  return true;
}
