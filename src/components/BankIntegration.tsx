import { useState, useEffect } from 'react';
import { Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getBelvoWidgetToken, initBelvoWidget, getBelvoAccounts, getBelvoTransactions } from '@/lib/belvoService';
import { getSession } from '@/lib/session';
import { supabase } from '@/lib/supabaseClient';

export const BankIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState<any[]>([]);

  useEffect(() => {
    loadConnectedBanks();
  }, []);

  const handleConnectClick = async () => {
    setIsLoading(true);
    try {
      toast.info('🏦 Conectando com Belvo...');
      
      // Obter Widget Token do backend VPS
      const widgetToken = await getBelvoWidgetToken();
      
      // Inicializar Belvo Widget
      initBelvoWidget(
        widgetToken,
        handleSuccess,
        handleError,
        () => {
          console.log('Widget fechado pelo usuário');
          setIsLoading(false);
        }
      );
      
    } catch (error) {
      console.error('Erro ao obter widget token:', error);
      toast.error('Erro ao conectar. Verifique se o backend está rodando.');
      setIsLoading(false);
    }
  };

  const handleSuccess = async (data: any) => {
    const { link, institution } = data;
    console.log('✅ Banco conectado:', link, institution);
    toast.success(`🎉 Conectado: ${institution.display_name || institution.name}`);

    const sessionId = getSession()?.sessionId;
    if (!sessionId) {
      toast.error('Sessão não encontrada');
      setIsLoading(false);
      return;
    }

    try {
      // Salvar informação da conexão no Supabase
      const { error } = await supabase.from('bank_connections').insert({
        session_id: sessionId.toString(),
        item_id: link.id,
        connector_name: institution.display_name || institution.name,
        connector_id: institution.name,
        status: 'connected',
        connected_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Erro ao salvar conexão:', error);
        toast.warning('Banco conectado, mas houve erro ao salvar');
      }

      toast.info('📊 Buscando transações...');
      
      // Buscar e importar transações (será feito pelo backend)
      // Por enquanto apenas salvamos a conexão
      
      toast.success('✅ Conexão salva com sucesso!');
      setIsLoading(false);
      loadConnectedBanks();
      
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      toast.error('Erro ao salvar conexão');
      setIsLoading(false);
    }
  };

  const handleError = (error: any) => {
    console.error('❌ Erro no widget:', error);
    toast.error('Erro ao conectar com o banco');
    setIsLoading(false);
  };

  const loadConnectedBanks = async () => {
    const sessionId = getSession()?.sessionId;
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('bank_connections')
       .select('*')
        .eq('session_id', sessionId.toString())
        .eq('status', 'connected');

      if (!error && data) {
        setConnectedBanks(data);
      }
    } catch (e) {
      console.error('Erro ao carregar bancos:', e);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Integração Bancária (Belvo)
        </CardTitle>
        <CardDescription>
          Conecte sua conta bancária para importar transações automaticamente usando Open Finance.
          <br />
          <span className="text-xs text-green-600 font-medium">✨ Plano gratuito: 25 conexões reais!</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedBanks.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Bancos Conectados:</h4>
            {connectedBanks.map((bank) => (
              <div
                key={bank.id}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{bank.connector_name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(bank.connected_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleConnectClick} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            <>
              <Building2 className="mr-2 h-4 w-4" />
              Conectar Banco
            </>
          )}
        </Button>

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Open Finance - Seguro e Regulamentado</p>
            <p>
              Usando <strong>Belvo</strong> (plataforma líder em Open Finance na América Latina).
              Seus dados são importados com segurança através do Open Finance regulamentado pelo Banco Central.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
