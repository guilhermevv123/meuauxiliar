import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import logoFull from "@/assets/logo-full.png";
import { supabase } from "@/lib/supabaseClient";
import { setAdminSession } from "@/lib/adminSession";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const email = loginData.email.trim();
      const password = loginData.password.trim();
      if (!email || !password) {
        toast.error("Preencha email e senha");
        return;
      }
      // Buscar por email e validar senha no cliente (evita bloqueios por política ao filtrar senha)
      // Tenta login seguro por RPC (hash). Se a função não existir, faz fallback para SELECT com senha plaintext.
      let { data, error } = await supabase
        .rpc("admin_login_hash", { p_email: email, p_senha: password })
        .maybeSingle();

      if (error && (error.message || "").includes("Could not find the function")) {
        const res = await supabase
          .from("admin_usuarios")
          .select("id, email, senha")
          .eq("email", email)
          .maybeSingle();
        if (res.error) {
          toast.error("Erro de login admin: " + res.error.message);
          return;
        }
        if (!res.data) {
          toast.error("Admin não encontrado com este email");
          return;
        }
        if (String(res.data.senha) !== password) {
          toast.error("Senha incorreta");
          return;
        }
        data = { id: res.data.id, email: res.data.email } as any;
      } else if (error) {
        toast.error("Erro de login admin: " + error.message);
        return;
      }
      if (!data) {
        toast.error("Credenciais inválidas");
        return;
      }
      setAdminSession({ email });
      toast.success("Admin autenticado");
      navigate("/admin/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-luxury border-border/50">
        <CardHeader className="text-center space-y-6">
          <img src={logoFull} alt="Meu Auxiliar" className="h-16 mx-auto" />
          <CardTitle className="text-3xl font-bold">Área Administrativa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={loginData.email} onChange={(e)=>setLoginData({...loginData, email:e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Senha</Label>
              <Input id="admin-password" type="password" value={loginData.password} onChange={(e)=>setLoginData({...loginData, password:e.target.value})} required />
            </div>
            <Button type="submit" className="w-full bg-gradient-purple" disabled={isLoading}>{isLoading?"Entrando...":"Entrar"}</Button>
            <div className="text-center">
              <Link to="/" className="text-sm text-primary hover:underline">Voltar ao site</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
