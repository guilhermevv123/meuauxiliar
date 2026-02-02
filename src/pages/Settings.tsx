import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

import { connectGoogleCalendar } from "@/lib/googleCalendar";
import { BankConnect } from "@/components/finance/BankConnect";

const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState("R$");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.provider_token) {
      setIsGoogleConnected(true);
    }
    setLoading(false);
  };

  const handleConnectGoogle = async () => {
    try {
      await connectGoogleCalendar();
    } catch (error) {
      toast.error("Erro ao conectar Google Calendar");
      console.error(error);
    }
  };

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
        
        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Google Calendar</Label>
                <p className="text-sm text-muted-foreground">
                  {isGoogleConnected 
                    ? "Sua agenda está conectada e sincronizada."
                    : "Conecte sua agenda para sincronizar eventos."}
                </p>
              </div>
              {isGoogleConnected ? (
                 <Button variant="outline" className="gap-2 text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 pointer-events-none">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Conectado
                </Button>
              ) : (
                <Button variant="outline" onClick={handleConnectGoogle} className="gap-2">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                  Conectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Integração Bancária */}
        <div className="lg:col-span-2">
          <BankConnect />
        </div>

        {/* Código original comentado para próxima versão
        <div className="lg:col-span-2">
          <BankIntegration />
        </div>
        */}
      </div>
    </div>
  );
};

export default SettingsPage;
