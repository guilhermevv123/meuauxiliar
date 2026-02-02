import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle, AlertCircle, ArrowUpRight, Building2, Link as LinkIcon } from 'lucide-react';
import { addFinanceiro } from '@/lib/api';
import { useAIStore } from '@/lib/useAIStore';
import { getSession } from '@/lib/session';
import { Link } from 'react-router-dom';

interface PixData {
  key: string;
  value: number;
  description: string;
  bank?: string;
}

interface PixConfirmationCardProps {
  data: PixData;
  onSuccess: () => void;
}

export const PixConfirmationCard = ({ data, onSuccess }: PixConfirmationCardProps) => {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [connectedBank, setConnectedBank] = useState<string | null>(null);
  
  const addMessage = useAIStore(state => state.addMessage);

  useEffect(() => {
    // Verificar conexão bancária
    const saved = localStorage.getItem('meuauxiliar_bank_connection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConnectedBank(parsed.bankName);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleConfirm = async () => {
    if (!password) {
      setErrorMessage('Digite sua senha');
      return;
    }
    
    setStatus('loading');
    
    // Simulação de verificação de senha
    // Em produção, isso chamaria uma Edge Function segura
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (password === '1234' || password.length > 3) { // Mock validation
      try {
        const sessionId = getSession()?.sessionId;
        if (sessionId) {
            await addFinanceiro({
                sessionId,
                type: 'despesa',
                value: data.value,
                category: 'PIX/Transferências',
                description: `PIX para ${data.key} ${data.bank ? `(${data.bank})` : ''} - ${data.description || ''} [Via ${connectedBank || 'Manual'}]`.trim(),
                dateIso: new Date().toISOString(),
                pago: 'sim',
                transacao_fixa: 'nao'
            });
        }
        
        setStatus('success');
        onSuccess();
        addMessage('assistant', `✅ PIX de R$ ${data.value.toFixed(2)} realizado com sucesso via ${connectedBank || 'Carteira Digital'}! Comprovante enviado.`);
      } catch (err) {
        setStatus('error');
        setErrorMessage('Erro ao processar pagamento');
      }
    } else {
      setStatus('error');
      setErrorMessage('Senha incorreta');
    }
  };

  if (status === 'success') {
    return (
      <Card className="w-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mb-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-green-800 dark:text-green-300">Pagamento Realizado</h3>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
             R$ {data.value.toFixed(2)} enviado para {data.key}
          </p>
          {connectedBank && (
            <Badge variant="outline" className="mt-2 bg-green-100 border-green-200 text-green-800">
              Via {connectedBank}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // Bloqueio se não houver banco conectado
  if (!connectedBank) {
      return (
        <Card className="w-full border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Conta Bancária Necessária
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-amber-700 dark:text-amber-500 mb-3">
                    Para realizar transferências reais, você precisa conectar sua conta bancária via Open Finance.
                </p>
                <Link to="/settings">
                    <Button variant="outline" size="sm" className="w-full border-amber-300 hover:bg-amber-100 text-amber-900">
                        <LinkIcon className="h-3 w-3 mr-2" />
                        Conectar Banco Agora
                    </Button>
                </Link>
            </CardContent>
        </Card>
      );
  }

  return (
    <Card className="w-full border-violet-200 dark:border-violet-800 shadow-sm overflow-hidden">
      <CardHeader className="bg-violet-50 dark:bg-violet-900/20 pb-4">
        <CardTitle className="text-base flex items-center gap-2 text-violet-800 dark:text-violet-300">
          <div className="p-1.5 bg-violet-100 dark:bg-violet-800 rounded-lg">
            <ArrowUpRight className="h-4 w-4 text-violet-600 dark:text-violet-300" />
          </div>
          Confirmar Transferência PIX
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        
        {/* Origem do Pagamento */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
            <Building2 className="h-4 w-4 text-slate-400" />
            <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-medium uppercase">Saindo de</p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{connectedBank} (Open Finance)</p>
            </div>
        </div>

        <div className="flex justify-between items-end border-b pb-2">
            <span className="text-sm text-slate-500">Valor</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">R$ {data.value.toFixed(2)}</span>
        </div>
        <div className="space-y-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Destinatário</p>
            <p className="text-sm font-medium truncate">{data.key}</p>
            {data.bank && <p className="text-xs text-slate-400">{data.bank}</p>}
        </div>
        
        <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Senha de Transação
            </label>
            <Input 
                type="password" 
                placeholder="****" 
                className="text-center tracking-widest text-lg"
                maxLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status === 'loading'}
            />
            {status === 'error' && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errorMessage}
                </p>
            )}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-3">
        <Button 
            className="w-full bg-violet-600 hover:bg-violet-700 text-white" 
            onClick={handleConfirm}
            disabled={status === 'loading' || !password}
        >
            {status === 'loading' ? 'Processando (Banco)...' : 'Confirmar Pagamento'}
        </Button>
      </CardFooter>
    </Card>
  );
};
