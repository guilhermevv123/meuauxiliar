import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import logoFull from "@/assets/logo-full.png";
import { supabase } from "@/lib/supabaseClient";
import { requestPhoneCode, verifyPhoneCode, normalizePhone } from "@/lib/phoneVerification";

const WEBHOOK_URL = "https://n8n-n8n-webhook.nyrnfd.easypanel.host/webhook/criacaodaconta";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "559",
    password: "",
    code: "",
  });

  const formatPhone = (raw: string) => {
    let digits = raw.replace(/[^0-9]/g, "");
    if (!digits.startsWith("55")) digits = "55" + digits;
    digits = digits.length >= 13 ? digits.slice(0,13) : digits.slice(0,12);
    const cc = "55";
    const ddd = digits.slice(2,4);
    const rest = digits.slice(4);
    return `${cc}${ddd?` ${ddd}`:""}${rest?` ${rest}`:""}`.trim();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("Preencha todos os campos");
      return;
    }
    // validação simples de telefone no formato 55 XX XXXX-XXXX (aceita variações com espaço ou traço)
    const phoneClean = normalizePhone(form.phone);
    if (!(phoneClean.length === 12 || phoneClean.length === 13)) {
      toast.error("Formato: 55 DD + número (8 ou 9 dígitos)");
      return;
    }
    setIsLoading(true);
    try {
      // Verificação de duplicidade no banco (email ou telefone já existente)
      const emailTrim = form.email.trim();
      const phoneClean = normalizePhone(form.phone);
      let exists = false;
      try {
        const { data: byEmail } = await supabase
          .from("clientes_meu_auxiliar")
          .select("id")
          .eq("email", emailTrim)
          .limit(1)
          .maybeSingle();
        const { data: byPhone } = await supabase
          .from("clientes_meu_auxiliar")
          .select("id")
          .eq("session_id", phoneClean)
          .limit(1)
          .maybeSingle();
        if (byEmail || byPhone) exists = true;
        if (!exists) {
          const { data: byEmailCase } = await supabase
            .from("clientes_meu_auxiliar")
            .select("id")
            .ilike("email", emailTrim)
            .limit(1)
            .maybeSingle();
          if (byEmailCase) exists = true;
        }
      } catch {}
      if (exists) {
        toast.error("Já existe uma conta com este email ou telefone");
        setIsLoading(false);
        return;
      }

      if (!form.code.trim()) {
        toast.error("Digite o código enviado para seu telefone");
        setIsLoading(false);
        return;
      }
      const ok = await verifyPhoneCode(form.phone, form.code.trim());
      if (!ok) {
        toast.error("Código inválido ou expirado");
        setIsLoading(false);
        return;
      }

      const payload = { ...form, phone: phoneClean, source: "app", created_at: new Date().toISOString() };
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Webhook falhou");
      toast.success("Cadastro enviado! Em breve entraremos em contato.");
      navigate("/auth");
    } catch (err) {
      toast.error("Não foi possível enviar seu cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative">
      <Link to="/auth" className="absolute top-6 left-6 z-10">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </Link>

      <Card className="w-full max-w-md shadow-luxury border-border/50">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <img src={logoFull} alt="Meu Auxiliar" className="h-16" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Crie sua conta</CardTitle>
            <CardDescription className="mt-2">Preencha seus dados para começarmos</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Nome</Label>
              <Input id="signup-name" placeholder="Seu nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
          <Label htmlFor="signup-phone">Telefone</Label>
          <Input 
            id="signup-phone"
            placeholder="55 DD 9 XXXXXXXX"
            value={formatPhoneBR(form.phone)}
            onChange={(e) => {
              let d = e.target.value.replace(/[^0-9]/g, "");
              if (!d.startsWith("55")) d = "55" + d;
              if (d.length >= 5 && d.charAt(4) === '9') d = d.slice(0,4) + d.slice(5); // remove 9 após DDD do estado
              d = d.slice(0, 12); // 55 + DD + 8 dígitos
              setForm({ ...form, phone: d });
            }}
            inputMode="numeric"
            pattern="[0-9\\s]*"
            maxLength={16}
            required 
          />
          <div className="flex gap-2 mt-2">
            <Input id="signup-code" placeholder="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="flex-1" />
            <Button type="button" variant="outline" onClick={async () => {
              try {
                const phoneClean = normalizePhone(form.phone);
                if (!(phoneClean.length === 12 || phoneClean.length === 13)) { toast.error("Telefone inválido"); return; }
                await requestPhoneCode(form.phone);
                toast.success("Código enviado");
              } catch (err) {
                toast.error("Não foi possível enviar o código");
              }
            }}>Enviar código</Button>
          </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Senha</Label>
              <Input id="signup-password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full bg-gradient-purple shadow-glow hover:scale-105 transition-transform" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Criar conta"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
            Ao continuar, você concorda com os nossos <Link to="/terms" className="underline">Termos de Uso</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
