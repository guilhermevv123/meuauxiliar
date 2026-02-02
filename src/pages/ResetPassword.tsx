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
import { requestPhoneCode, verifyPhoneCode, normalizePhone, formatPhoneBR, phoneSearchKey, getPhoneSearchVariants } from "@/lib/phoneVerification";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "verification" | "new-password">("phone");
  const [phone, setPhone] = useState("55");
  const [foundSessionId, setFoundSessionId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const searchVariants = getPhoneSearchVariants(phone);
      console.log("🔍 Buscando telefone por variantes:", searchVariants);
      
      const { data, error } = await supabase
        .from("clientes_meu_auxiliar")
        .select("session_id")
        .in("session_id", searchVariants)
        .maybeSingle();

      if (error) {
        console.error("❌ Erro ao buscar telefone:", error);
        toast.error("Erro ao verificar telefone: " + error.message);
        return;
      }

      if (!data) {
        console.warn("⚠️ Telefone não encontrado nas variantes:", searchVariants);
        toast.error("Telefone não encontrado em nossa base de dados");
        return;
      }

      console.log("✅ Telefone encontrado! SessionID:", data.session_id);
      setFoundSessionId(data.session_id);
      await requestPhoneCode(phone);
      toast.success("Código de verificação enviado para seu telefone!");
      setStep("verification");
    } catch (err) {
      console.error("❌ Erro ao solicitar redefinição:", err);
      toast.error("Erro ao processar solicitação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const isValid = await verifyPhoneCode(phone, verificationCode);
      
      if (!isValid) {
        toast.error("Código de verificação inválido ou expirado");
        return;
      }
      
      toast.success("Código verificado com sucesso!");
      setStep("new-password");
    } catch (err) {
      console.error("Erro ao verificar código:", err);
      toast.error("Erro ao verificar código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (newPassword !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }
      
      if (newPassword.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
      
      const targetSessionId = foundSessionId || normalizePhone(phone);
      console.log("🔐 Atualizando senha para session_id:", targetSessionId);

      const { error } = await supabase
        .from("clientes_meu_auxiliar")
        .update({ Senha: newPassword })
        .eq("session_id", targetSessionId);

      if (error) {
        toast.error("Erro ao atualizar senha: " + error.message);
        return;
      }
      
      toast.success("Senha redefinida com sucesso!");
      navigate("/auth");
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      toast.error("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      const searchVariants = getPhoneSearchVariants(phone);
      const { data } = await supabase
        .from("clientes_meu_auxiliar")
        .select("session_id")
        .in("session_id", searchVariants)
        .maybeSingle();

      if (!data) { toast.error("Telefone não encontrado em nossa base"); return; }
      setFoundSessionId(data.session_id);
      await requestPhoneCode(phone);
      toast.success("Novo código enviado para seu telefone!");
    } catch (err) {
      console.error("Erro ao reenviar código:", err);
      toast.error("Erro ao reenviar código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative">
      {/* Botão Voltar */}
      <Link 
        to="/login"
        className="absolute top-6 left-6 z-10"
      >
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para login
        </Button>
      </Link>

      <Card className="w-full max-w-md shadow-luxury border-border/50">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <img src={logoFull} alt="Meu Auxiliar" className="h-16" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Redefinir Senha</CardTitle>
            <CardDescription className="mt-2">
              {step === "phone" && "Informe seu telefone para receber o código de verificação"}
              {step === "verification" && "Digite o código de verificação enviado para seu celular"}
              {step === "new-password" && "Crie uma nova senha para sua conta"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "phone" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-phone">Telefone</Label>
                <Input
                  id="reset-phone"
                  type="tel"
                  placeholder="55 DD 9 XXXXXXXX"
                  inputMode="numeric"
                  pattern="[0-9\s]*"
                  maxLength={16}
                  required
                  value={formatPhoneBR(phone)}
                  onChange={(e) => {
                    let d = e.target.value.replace(/[^0-9]/g, "");
                    // Just basic guard to avoid clearing 55
                    if (d.length < 2) d = "55";
                    if (!d.startsWith("55")) d = "55" + d;
                    // Limit to 13 digits (55 + DDD + 9 digits)
                    setPhone(d.slice(0, 13));
                  }}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-purple shadow-glow hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar código por telefone"}
              </Button>
            </form>
          )}

          {step === "verification" && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de verificação</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Digite o código de 6 dígitos"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Não recebeu o código? <button type="button" className="text-primary hover:underline" onClick={handleResendCode}>Reenviar</button>
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-purple shadow-glow hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Verificar código"}
              </Button>
            </form>
          )}

          {step === "new-password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirme a nova senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-purple shadow-glow hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                {isLoading ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
