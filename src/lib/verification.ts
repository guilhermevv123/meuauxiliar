import { supabase } from "./supabaseClient";

/**
 * Gera um código de verificação aleatório de 6 dígitos
 */
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Armazena um código de verificação para um email específico
 * @param email Email do usuário
 * @param code Código de verificação
 * @param expiresIn Tempo de expiração em minutos (padrão: 15 minutos)
 */
export const storeVerificationCode = async (
  email: string,
  code: string,
  expiresIn: number = 15
): Promise<boolean> => {
  try {
    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresIn);

    // Remover códigos antigos para este email
    await supabase
      .from("verification_codes")
      .delete()
      .eq("email", email);

    // Inserir novo código
    const { error } = await supabase.from("verification_codes").insert({
      email,
      code,
      expires_at: expiresAt.toISOString(),
    });

    return !error;
  } catch (err) {
    console.error("Erro ao armazenar código de verificação:", err);
    return false;
  }
};

/**
 * Verifica se um código é válido para um email específico
 * @param email Email do usuário
 * @param code Código de verificação
 */
export const verifyCode = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .gt("expires_at", now)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    // Remover o código após verificação bem-sucedida
    await supabase
      .from("verification_codes")
      .delete()
      .eq("email", email)
      .eq("code", code);

    return true;
  } catch (err) {
    console.error("Erro ao verificar código:", err);
    return false;
  }
};