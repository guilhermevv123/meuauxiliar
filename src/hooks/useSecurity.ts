import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, clearSession, renewSession } from '@/lib/session';
import { 
  checkRateLimit, 
  logActivity, 
  detectSuspiciousActivity,
  sanitizeInput 
} from '@/lib/security';
import { toast } from 'sonner';

/**
 * Hook de segurança para proteger componentes e rotas
 */
export function useSecurity() {
  const navigate = useNavigate();
  const activityCheckInterval = useRef<NodeJS.Timeout>();
  
  // Verifica sessão periodicamente
  useEffect(() => {
    const checkSession = () => {
      const session = getSession();
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/login');
      }
    };
    
    // Verifica a cada 5 minutos
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [navigate]);
  
  // Monitora atividade suspeita
  useEffect(() => {
    const session = getSession();
    if (!session) return;
    
    activityCheckInterval.current = setInterval(() => {
      if (detectSuspiciousActivity(session.sessionId)) {
        toast.error('Atividade suspeita detectada. Por segurança, você será desconectado.');
        clearSession();
        navigate('/login');
      }
    }, 30000); // Verifica a cada 30 segundos
    
    return () => {
      if (activityCheckInterval.current) {
        clearInterval(activityCheckInterval.current);
      }
    };
  }, [navigate]);
  
  /**
   * Executa ação com proteção de rate limiting
   */
  const withRateLimit = useCallback(async <T,>(
    action: () => Promise<T>,
    key: string,
    maxRequests: number = 100
  ): Promise<T | null> => {
    const session = getSession();
    if (!session) {
      toast.error('Sessão inválida');
      navigate('/login');
      return null;
    }
    
    const rateLimitKey = `${session.sessionId}_${key}`;
    
    if (!checkRateLimit(rateLimitKey, maxRequests)) {
      toast.error('Muitas requisições. Aguarde um momento.');
      return null;
    }
    
    logActivity(session.sessionId, key);
    
    try {
      return await action();
    } catch (error) {
      console.error('Erro na ação protegida:', error);
      throw error;
    }
  }, [navigate]);
  
  /**
   * Sanitiza input do usuário
   */
  const sanitize = useCallback((input: string): string => {
    return sanitizeInput(input);
  }, []);
  
  /**
   * Renova a sessão do usuário
   */
  const refresh = useCallback((): boolean => {
    return renewSession();
  }, []);
  
  /**
   * Faz logout seguro
   */
  const logout = useCallback(() => {
    clearSession();
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  }, [navigate]);
  
  return {
    withRateLimit,
    sanitize,
    refresh,
    logout
  };
}

/**
 * Hook para proteger formulários contra injeção
 */
export function useSecureForm() {
  const { sanitize } = useSecurity();
  
  /**
   * Sanitiza todos os campos de um objeto
   */
  const sanitizeFormData = useCallback(<T extends Record<string, any>>(
    data: T
  ): T => {
    const sanitized = { ...data };
    
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitize(sanitized[key]) as any;
      }
    }
    
    return sanitized;
  }, [sanitize]);
  
  return {
    sanitizeFormData,
    sanitize
  };
}

/**
 * Hook para monitorar tentativas de acesso não autorizado
 */
export function useAccessControl() {
  const navigate = useNavigate();
  const attemptCount = useRef(0);
  const MAX_ATTEMPTS = 5;
  
  const checkAccess = useCallback((hasPermission: boolean, resource: string) => {
    if (!hasPermission) {
      attemptCount.current++;
      
      console.warn(`⚠️ Tentativa de acesso não autorizado: ${resource}`);
      
      if (attemptCount.current >= MAX_ATTEMPTS) {
        toast.error('Múltiplas tentativas de acesso não autorizado detectadas. Você será desconectado.');
        clearSession();
        navigate('/login');
        return false;
      }
      
      toast.error('Acesso negado');
      return false;
    }
    
    return true;
  }, [navigate]);
  
  return { checkAccess };
}
