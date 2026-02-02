import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateClienteSenha } from "@/lib/api";
import { getSession } from "@/lib/session";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Profile = () => {
  const session = getSession();
  const email = session?.email ?? "";
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ current: "", password: "", confirm: "" });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Sessão inválida"); return; }
    if (!form.password || form.password.length < 6) { toast.error("Senha deve ter ao menos 6 caracteres"); return; }
    if (form.password !== form.confirm) { toast.error("As senhas não conferem"); return; }
    setIsLoading(true);
    try {
      // Como o login atual é direto na tabela, não conseguimos validar a senha atual aqui sem expor a hash.
      // Então apenas atualizamos a senha pela combinação de email (melhorar quando migrar para Supabase Auth).
      await updateClienteSenha(email, form.password);
      toast.success("Senha atualizada");
      setForm({ current: "", password: "", confirm: "" });
    } catch {
      toast.error("Falha ao atualizar senha");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
      </Link>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>
            <div>
              <Label>Nova senha</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <div>
              <Label>Confirmar nova senha</Label>
              <Input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={isLoading}>Salvar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
