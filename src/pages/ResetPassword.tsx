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
import { requestPhoneCode, verifyPhoneCode, normalizePhone, formatPhoneBR, phoneSearchKey } from "@/lib/phoneVerification";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "verification" | "new-password">("phone");
  const [phone, setPhone] = useState("559");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const searchKey = phoneSearchKey(phone);
      const { data, error } = await supabase
        .from("clientes_meu_auxiliar")
        .select("session_id")
        .eq("session_id", searchKey)
        .maybeSingle();

      if (error) {
        toast.error("Erro ao verificar telefone: " + error.message);
        return;
      }

      if (!data) {
        toast.error("Telefone não encontrado em nossa base de dados");
        return;
      }

      await requestPhoneCode(phone);
      toast.success("Código de verificação enviado para seu telefone!");
      setStep("verification");
    } catch (err) {
      console.error("Erro ao solicitar redefinição:", err);
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
      
      const phoneNorm = normalizePhone(phone);
      const { error } = await supabase
        .from("clientes_meu_auxiliar")
        .update({ Senha: newPassword, senha: newPassword })
        .eq("session_id", phoneNorm);

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
      // Verifica novamente a existência sem o 9 antes de reenviar
      const searchKey = phoneSearchKey(phone);
      const { data } = await supabase
        .from("clientes_meu_auxiliar")
        .select("session_id")
        .eq("session_id", searchKey)
        .maybeSingle();
      if (!data) { toast.error("Telefone não encontrado em nossa base"); return; }
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
              {step === "email" && "Informe seu email para receber o código de verificação"}
              {step === "verification" && "Digite o código de verificação enviado para seu email"}
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
                    if (!d.startsWith("55")) d = "55" + d;
                    if (d.length >= 5 && d.charAt(4) === '9') d = d.slice(0,4) + d.slice(5);
                    d = d.slice(0, 12);
                    setPhone(d);
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
