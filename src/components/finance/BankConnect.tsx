import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Building2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";

// Simulando persistência simples no client-side por enquanto
const STORAGE_KEY = 'meuauxiliar_bank_connection';

export const BankConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectingBank, setConnectingBank] = useState<string | null>(null);
  const [connectedBankName, setConnectedBankName] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      setIsConnected(true);
      setConnectedBankName(data.bankName);
    }
  }, []);

  const handleConnect = async (bankName: string) => {
    setConnectingBank(bankName);
    
    // Simula delay de redirect para o banco e autorização
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simula sucesso
    const connectionData = {
      bankName,
      connectedAt: new Date().toISOString(),
      provider: 'open_finance_simulator'
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(connectionData));
    setIsConnected(true);
    setConnectedBankName(bankName);
    setConnectingBank(null);
    toast.success(`Conta do ${bankName} conectada com sucesso!`);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsConnected(false);
    setConnectedBankName(null);
    toast.info("Conta desconectada.");
  };

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                <Building2 className="h-5 w-5 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base text-green-800 dark:text-green-300">Conta Conectada</CardTitle>
                <CardDescription className="text-green-700 dark:text-green-400">
                  {connectedBankName} (Via Open Finance)
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 h-6">
              Ativo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Permissão para iniciar pagamentos PIX ativa.</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDisconnect}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            Desconectar Conta
          </Button>
        </CardContent>
      </Card>
    );
  }

  const banks = [
    { name: 'Nubank', color: 'bg-[#820AD1]' },
    { name: 'Inter', color: 'bg-[#FF7A00]' },
    { name: 'Itaú', color: 'bg-[#EC7000]' },
    { name: 'Bradesco', color: 'bg-[#CC092F]' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-violet-600" />
          Conectar Conta Bancária
        </CardTitle>
        <CardDescription>
          Vincule seu banco para permitir que a IA realize pagamentos PIX diretamente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {banks.map((bank) => (
            <Button
              key={bank.name}
              variant="outline"
              className="h-auto py-3 px-4 justify-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group"
              onClick={() => handleConnect(bank.name)}
              disabled={!!connectingBank}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${bank.color} group-hover:scale-110 transition-transform`}>
                {bank.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{bank.name}</span>
                <span className="text-[10px] text-muted-foreground">Open Finance</span>
              </div>
              {connectingBank === bank.name && (
                <Loader2 className="ml-auto h-4 w-4 animate-spin text-slate-400" />
              )}
            </Button>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-3 text-xs text-blue-700 dark:text-blue-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            Ao conectar, você será redirecionado para o aplicativo do seu banco para autorizar a permissão de "Iniciação de Pagamento". Nós nunca temos acesso à sua senha bancária.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
