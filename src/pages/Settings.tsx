import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("R$");

  const onSave = () => {
    try {
      localStorage.setItem("settings", JSON.stringify({ notifications, currency }));
      toast.success("Configurações salvas");
    } catch {
      toast.error("Falha ao salvar configurações");
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <Link to="/dashboard" className="inline-flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Notificações</Label>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div>
              <Label>Moeda</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="R$" className="max-w-[120px]" />
            </div>
            <Button onClick={onSave}>Salvar</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
