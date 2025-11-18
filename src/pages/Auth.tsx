import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft } from "lucide-react";
import logoFull from "@/assets/logo-full.png";
import { supabase } from "@/lib/supabaseClient";
import { setSession } from "@/lib/session";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { email, password } = loginData;
      console.log("🔐 Tentando login com:", { email, passwordLength: password.length });
      
      if (!email || !password) {
        toast.error("Preencha email e senha");
        return;
      }
      
      // Login customizado na tabela "clientes_meu_auxiliar"
      // Colunas: email, Senha (observa maiúscula), session_id (telefone)
      const { data, error } = await supabase
        .from("clientes_meu_auxiliar")
        .select("email, Senha, session_id, created_at")
        .eq("email", email)
        .eq("Senha", password)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log("🔐 Resposta do banco:", { data, error, hasData: !!data });

      if (error) {
        console.error("❌ Erro no login:", error);
        toast.error("Erro ao consultar banco de dados: " + error.message);
        return;
      }

      if (!data) {
        console.log("❌ Nenhum usuário encontrado com essas credenciais");
        toast.error("Email ou senha incorretos");
        return;
      }

      console.log("✅ Login bem-sucedido! Dados do usuário:", {
        email: data.email,
        session_id: data.session_id,
        session_id_type: typeof data.session_id,
        sessionId: String(data.session_id)
      });

      setSession({ email: data.email, sessionId: String(data.session_id) });
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Erro inesperado no login:", err);
      toast.error("Erro ao entrar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4 relative">
      {/* Botão Voltar */}
      <Link 
        to="/"
        className="absolute top-6 left-6 z-10"
      >
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
            <CardTitle className="text-3xl font-bold">Bem-vindo de volta!</CardTitle>
            <CardDescription className="mt-2">
              Entre com sua conta para continuar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu@email.com"
                required
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <div className="text-right">
                <Link to="/reset-password" className="text-sm text-primary hover:underline">
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-purple shadow-glow hover:scale-105 transition-transform"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Não tem conta?
              </span>
            </div>
          </div>

          <Link to="/signup" className="block">
            <Button 
              type="button"
              variant="outline"
              className="w-full border-2 hover:bg-primary/5 transition-all"
            >
              Faça seu cadastro
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
