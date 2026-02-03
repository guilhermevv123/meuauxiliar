import { supabase } from "./supabaseClient";

export function normalizePhone(raw: string) {
  let digits = raw.replace(/[^0-9]/g, "");
  
  // Enforce country code 55 if missing
  if (!digits.startsWith("55") && digits.length >= 10) {
    digits = "55" + digits;
  } else if (!digits.startsWith("55") && digits.length < 10 && digits.length > 0) {
    // If it looks like just a local number, we can't be sure of DDD, 
    // but the app seems to expect 55 + DDD + number.
    // For now, let's just ensure it has 55 if it's long enough.
  }

  // Brasil: 55 + DDD(2) + 9 + número(8 ou 9)
  // If it's a 10-digit number (DDD + 8 digits), we add the 9 if missing
  // If it's 11 digits (DDD + 9 digits), it's already full.
  
  const body = digits.startsWith("55") ? digits.slice(2) : digits;
  const cc = digits.startsWith("55") ? "55" : "";
  
  if (body.length === 10) { // DDD + 8 digits
     digits = cc + body.slice(0, 2) + '9' + body.slice(2);
  }
  
  return digits.slice(0, 13); // Max 55 + 11 digits
}

export function formatPhoneBR(raw: string) {
  let d = raw.replace(/[^0-9]/g, "");
  if (d.length > 0 && !d.startsWith("55")) d = "55" + d;
  
  const cc = d.slice(0, 2); // 55
  const ddd = d.slice(2, 4);
  const rest = d.slice(4);
  
  if (ddd.length < 2) return d;
  
  // If we have at least DDD, show it
  let formatted = `${cc} ${ddd}`;
  
  if (rest.length > 0) {
    // Brazilian mobile numbers usually have a 9
    // If the number already has 9 digits, use it as is
    // If it has 8, we can show it with space if it's a mobile
    if (rest.length > 8) {
       formatted += ` ${rest.slice(0, 5)} ${rest.slice(5, 9)}`;
    } else {
       formatted += ` ${rest.slice(0, 4)} ${rest.slice(4, 8)}`;
    }
  }
  
  return formatted.trim();
}

// Usado para pesquisa no banco sem o primeiro 9 após DDD se necessário, 
// ou retornando uma lista de formatos possíveis para busca.
export function getPhoneSearchVariants(raw: string) {
  let d = raw.replace(/[^0-9]/g, "");
  if (d.length > 0 && !d.startsWith("55")) d = "55" + d;
  
  const cc = d.slice(0, 2);
  const ddd = d.slice(2, 4);
  const rest = d.slice(4);
  
  const variants: string[] = [];
  
  if (rest.length === 9 && rest.startsWith('9')) {
    // Has 9 digits, including the leading 9
    variants.push(cc + ddd + rest); // Full 13
    variants.push(cc + ddd + rest.slice(1)); // 12 digits (without the 9)
  } else if (rest.length === 8) {
    // Has 8 digits
    variants.push(cc + ddd + rest); // 12 digits
    variants.push(cc + ddd + '9' + rest); // 13 digits (with the 9)
  } else {
    variants.push(d);
  }
  
  return Array.from(new Set(variants));
}

export function phoneSearchKey(raw: string) {
  // Keeping this for backward compatibility if used elsewhere, 
  // but we should favor looking for both formats.
  let d = raw.replace(/[^0-9]/g, "");
  if (d.length > 0 && !d.startsWith("55")) d = "55" + d;
  if (d.length >= 5 && d.charAt(4) === '9') {
    d = d.slice(0,4) + d.slice(5); // remove o primeiro 9 após DDD
  }
  return d.slice(0,12);
}

export async function requestPhoneCode(phoneRaw: string) {
  const phone = normalizePhone(phoneRaw);
  
  try {
    // Gerar código de verificação de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Calcular data de expiração (15 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Remover códigos antigos para este telefone
    await supabase
      .from("verification_codes")
      .delete()
      .eq("phone", phone);

    // Inserir novo código (usando campo 'phone' em vez de 'email')
    const { error } = await supabase.from("verification_codes").insert({
      phone,
      code,
      channel: 'sms', // Canal de envio (sms para telefone)
      target: phone, // Destinatário (número de telefone)
      purpose: 'password_reset', // Finalidade do código
      expires_at: expiresAt.toISOString(),
    });

    if (error) {
      console.error("❌ Erro ao armazenar código:", error);
      throw error;
    }

    console.log("✅ Código gerado e armazenado:", { phone, code });
    
    // Buscar email do usuário no banco de dados
    const searchVariants = getPhoneSearchVariants(phoneRaw);
    const { data: userData } = await supabase
      .from("clientes_meu_auxiliar")
      .select("email, session_id")
      .in("session_id", searchVariants)
      .maybeSingle();

    // Enviar para o webhook
    try {
      const webhookUrl = 'https://meuauxiliar-n8n.nyrnfd.easypanel.host/webhook/esqueciminhasenha1231';
      const webhookData = {
        code,
        phone,
        email: userData?.email || '',
        message: `Seu código de verificação é: ${code}`
      };

      console.log("📤 Enviando para webhook:", webhookUrl, webhookData);

      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData)
      });

      if (!webhookResponse.ok) {
        console.warn("⚠️ Webhook retornou erro:", webhookResponse.status);
      } else {
        console.log("✅ Webhook enviado com sucesso!");
      }
    } catch (webhookError) {
      console.error("❌ Erro ao enviar webhook:", webhookError);
      // Não falhar o fluxo se o webhook falhar
    }

    return { success: true, code };
  } catch (error) {
    console.error("❌ Erro ao solicitar código:", error);
    throw error;
  }
}

export async function verifyPhoneCode(phoneRaw: string, code: string) {
  const phone = normalizePhone(phoneRaw);
  
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("phone", phone)
      .eq("code", code)
      .gt("expires_at", now)
      .maybeSingle();

    if (error || !data) {
      console.error("❌ Código inválido ou expirado");
      return false;
    }

    // Remover o código após verificação bem-sucedida
    await supabase
      .from("verification_codes")
      .delete()
      .eq("phone", phone)
      .eq("code", code);

    console.log("✅ Código verificado com sucesso!");
    return true;
  } catch (err) {
    console.error("❌ Erro ao verificar código:", err);
    return false;
  }
}
