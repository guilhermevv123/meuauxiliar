// Belvo API Configuration
const BELVO_API_URL = 'https://api.belvo.com';

/**
 * Belvo Open Finance Integration Service
 * Plano Gratuito: 25 links reais + sandbox ilimitado
 * Documentação: https://developers.belvo.com
 */

// Será configurado no backend VPS
export interface BelvoConfig {
  secretId: string;
  secretPassword: string;
  environment: 'sandbox' | 'production';
}

interface BelvoAccessToken {
  access: string;
  refresh: string;
  access_token_expires: number;
  refresh_token_expires: number;
}

interface BelvoWidgetToken {
  access: string;
}

/**
 * Função para obter Access Token
 * DEVE ser chamada do backend (VPS)
 */
export async function getBelvoAccessToken(
  secretId: string,
  secretPassword: string
): Promise<BelvoAccessToken> {
  const credentials = btoa(`${secretId}:${secretPassword}`);

  const response = await fetch(`${BELVO_API_URL}/api/token/`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get Belvo access token');
  }

  return await response.json();
}

/**
 * Criar Widget Token (através do backend VPS)
 * Este token é usado para inicializar o Connect Widget
 */
export async function getBelvoWidgetToken(): Promise<string> {
  try {
    // Chama o backend VPS que você vai hospedar
    const backendUrl = import.meta.env.VITE_BELVO_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/belvo/widget-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get widget token from backend');
    }

    const data = await response.json();
    return data.access;
  } catch (error) {
    console.error('Error getting Belvo widget token:', error);
    throw error;
  }
}

/**
 * Inicializar Belvo Connect Widget
 * Documentação: https://developers.belvo.com/docs/connect-widget
 */
export function initBelvoWidget(
  accessToken: string,
  onSuccess: (link: any) => void,
  onError: (error: any) => void,
  onExit: () => void
): void {
  // Carregar script do Belvo Widget se ainda não foi carregado
  if (!window.belvoSDK) {
    const script = document.createElement('script');
    script.src = 'https://cdn.belvo.io/belvo-widget-1-stable.js';
    script.async = true;
    script.onload = () => {
      createBelvoWidget(accessToken, onSuccess, onError, onExit);
    };
    document.body.appendChild(script);
  } else {
    createBelvoWidget(accessToken, onSuccess, onError, onExit);
  }
}

function createBelvoWidget(
  accessToken: string,
  onSuccess: (link: any) => void,
  onError: (error: any) => void,
  onExit: () => void
): void {
  const config = {
    accessToken,
    country_codes: ['BR'], // Apenas Brasil
    institution_types: ['bank', 'fiscal'], // Bancos e dados fiscais
    locale: 'pt', // Português
    callback: (link: any, institution: any) => {
      console.log('✅ Belvo Link criado:', link, institution);
      onSuccess({ link, institution });
    },
    onExit: (data: any) => {
      console.log('👋 Usuário saiu do widget:', data);
      onExit();
    },
    onError: (error: any) => {
      console.error('❌ Erro no widget Belvo:', error);
      onError(error);
    },
  };

  window.belvoSDK.createWidget(config).build();
}

/**
 * Buscar dados de uma conta (Link)
 */
export async function getBelvoAccounts(linkId: string, accessToken: string): Promise<any[]> {
  const response = await fetch(`${BELVO_API_URL}/api/accounts/?link=${linkId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }

  const data = await response.json();
  return data.results || [];
}

/**
 * Buscar transações de uma conta
 */
export async function getBelvoTransactions(
  linkId: string,
  accessToken: string,
  dateFrom?: string,
  dateTo?: string
): Promise<any[]> {
  let url = `${BELVO_API_URL}/api/transactions/?link=${linkId}`;
  if (dateFrom) url += `&date_from=${dateFrom}`;
  if (dateTo) url += `&date_to=${dateTo}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  const data = await response.json();
  return data.results || [];
}

// Declaração global para TypeScript
declare global {
  interface Window {
    belvoSDK: any;
  }
}
