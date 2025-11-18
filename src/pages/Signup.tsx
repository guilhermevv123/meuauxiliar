import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import logoFull from "@/assets/logo-full.png";

const WEBHOOK_URL = "https://n8n-n8n-webhook.nyrnfd.easypanel.host/webhook/criacaodaconta";

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const formatPhone = (raw: string) => {
    let digits = raw.replace(/[^0-9]/g, "");
    if (!digits.startsWith("55")) digits = "55" + digits; // força prefixo 55
    // limita a 55 + DDD(2) + número (exatos 8 dígitos): 55 + 10 = 12 dígitos
    digits = digits.slice(0, 12);
    const cc = "55";
    const ddd = digits.slice(2, 4);
    const rest = digits.slice(4);
    let left = rest;
    let part1 = left.slice(0, Math.min(4, left.length));
    let part2 = left.slice(4, Math.min(8, left.length));
    const hasDDD = ddd.length > 0;
    const hasPart1 = part1.length > 0;
    const hasPart2 = part2.length > 0;
    return `${cc}${hasDDD ? ` ${ddd}` : ""}${hasPart1 ? ` ${part1}` : ""}${hasPart2 ? `-${part2}` : ""}`.trim();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("Preencha todos os campos");
      return;
    }
    // validação simples de telefone no formato 55 XX XXXX-XXXX (aceita variações com espaço ou traço)
    const phoneClean = form.phone.replace(/[^0-9]/g, "");
    if (!phoneClean.startsWith("55") || phoneClean.length !== 12) {
      toast.error("Telefone no formato 55 XX XXXX-XXXX (8 dígitos no número)");
      return;
    }
    setIsLoading(true);
    try {
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
                placeholder="55 XX XXXX-XXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                inputMode="numeric"
                pattern="[0-9\\s-]*"
                maxLength={18}
                required 
              />
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
