import { generateVerificationCode, storeVerificationCode } from './verification';

/**
 * Interface para a resposta do webhook
 */
export interface WebhookResponse {
  success: boolean;
  email?: string;
  code?: string;
  message?: string;
}

/**
 * Processa uma solicitação de código de verificação e retorna os dados necessários
 * para envio de email
 * @param email Email do usuário
 */
export const processVerificationRequest = async (email: string): Promise<WebhookResponse> => {
  try {
    // Verificar se o email existe (aqui você pode adicionar sua lógica de verificação)
    
    // Gerar código de verificação
    const code = generateVerificationCode();
    
    // Armazenar o código com expiração de 24 horas (1440 minutos)
    const stored = await storeVerificationCode(email, code, 1440);
    
    if (!stored) {
      return {
        success: false,
        message: 'Erro ao armazenar código de verificação'
      };
    }
    
    // Retornar dados para webhook
    return {
      success: true,
      email,
      code,
      message: 'Código de verificação gerado com sucesso'
    };
  } catch (error) {
    console.error('Erro ao processar solicitação de verificação:', error);
    return {
      success: false,
      message: 'Erro ao processar solicitação de verificação'
    };
  }
};