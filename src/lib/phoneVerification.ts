import { supabase } from "./supabaseClient";

export function normalizePhone(raw: string) {
  let digits = raw.replace(/[^0-9]/g, "");
  if (!digits.startsWith("55")) digits = "55" + digits;
  // Brasil: 55 + DDD(2) + 9 + número(8 ou 9)
  if (digits.length >= 4 && digits.charAt(4) !== '9') {
    digits = digits.slice(0, 4) + '9' + digits.slice(4);
  }
  if (digits.length >= 13) return digits.slice(0, 13);
  return digits.slice(0, 12);
}

export function formatPhoneBR(raw: string) {
  let d = raw.replace(/[^0-9]/g, "");
  if (!d.startsWith("55")) d = "55" + d;
  const cc = d.slice(0, 2); // 55
  const ddd = d.slice(2, 4);
  const local = d.slice(4, 12); // até 8 dígitos de número
  const nine = ddd.length === 2 ? " 9" : ""; // exibe 9 após DDD
  return `${cc}${ddd?` ${ddd}`:""}${nine}${local?` ${local}`:""}`.trim();
}

// Usado para pesquisa no banco sem o primeiro 9 após DDD
export function phoneSearchKey(raw: string) {
  let d = raw.replace(/[^0-9]/g, "");
  if (!d.startsWith("55")) d = "55" + d;
  if (d.length >= 5 && d.charAt(4) === '9') {
    d = d.slice(0,4) + d.slice(5); // remove o primeiro 9 após DDD
  }
  return d.slice(0,12);
}

export async function requestPhoneCode(phoneRaw: string) {
  const phone = normalizePhone(phoneRaw);
  const { data, error } = await supabase.rpc("temp_phone_generate", { p_phone: phone });
  if (error) throw error;
  return data as any;
}

export async function verifyPhoneCode(phoneRaw: string, code: string) {
  const phone = normalizePhone(phoneRaw);
  const { data, error } = await supabase.rpc("temp_phone_verify", { p_phone: phone, p_code: code });
  if (error) throw error;
  return Boolean(data);
}
