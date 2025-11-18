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
import { verifyCode } from "@/lib/verification";
import { processVerificationRequest } from "@/lib/webhook";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "verification" | "new-password">("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Verificar se o email existe na base de dados
      const { data, error } = await supabase
        .from("clientes_meu_auxiliar")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        toast.error("Erro ao verificar email: " + error.message);
        return;
      }

      if (!data) {
        toast.error("Email não encontrado em nossa base de dados");
        return;
      }

      // Processar solicitação via webhook
      const response = await processVerificationRequest(email);
      
      if (!response.success) {
        toast.error(response.message || "Erro ao gerar código de verificação");
        return;
      }
      
      // Em um sistema real, o código seria enviado por email através do webhook
      // Aqui vamos apenas mostrar no console para fins de teste
      console.log("Dados do webhook:", {
        email: response.email,
        code: response.code
      });
      
      toast.success("Código de verificação enviado para seu email!");
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
      // Verificar o código
      const isValid = await verifyCode(email, verificationCode);
      
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
      
      // Atualizar a senha no banco de dados
      const { error } = await supabase
        .from("clientes_meu_auxiliar")
        .update({ Senha: newPassword })
        .eq("email", email);

      if (error) {
        toast.error("Erro ao atualizar senha: " + error.message);
        return;
      }
      
      toast.success("Senha redefinida com sucesso!");
      navigate("/login");
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
      // Processar nova solicitação via webhook
      const response = await processVerificationRequest(email);
      
      if (!response.success) {
        toast.error(response.message || "Erro ao gerar novo código");
        return;
      }
      
      // Em um sistema real, o código seria enviado por email através do webhook
      console.log("Dados do webhook para reenvio:", {
        email: response.email,
        code: response.code
      });
      
      toast.success("Novo código enviado para seu email!");
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
          {step === "email" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-purple shadow-glow hover:scale-105 transition-transform"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar código de verificação"}
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