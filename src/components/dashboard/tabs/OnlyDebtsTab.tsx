import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, TrendingDown, DollarSign, Calendar, CreditCard, Percent, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession } from "@/lib/session";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { DebtDialog } from "../DebtDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFinanceiro, getDividasFinanciamentos, getDividaTotal, getDividaPrimeira, upsertDividaTotal, upsertDividaPrimeira, type FinanceRow } from "@/lib/api";

type Debt = {
  id: number;
  session_id: string;
  tipo: "divida" | "financiamento";
  descricao: string;
  nome?: string | null;
  valor: number;
  categoria: string | null;
  data_transacao: string;
  prazo?: string | null;
  prazo_data?: string | null;
  financiamento?: string | null;
  divida?: string | null;
  pago?: string | null;
  a_pagar?: string | null;
};

type InstallmentInfo = {
  total: number;
  paid: number;
  remaining: number;
  valuePerInstallment: number;
  nextDueDate: Date | null;
};

export const OnlyDebtsTab = () => {
  const sessionId = getSession()?.sessionId ?? "";
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const { data: financeData = [], isLoading, refetch } = useQuery({
    queryKey: ["debts_finance", sessionId],
    queryFn: () => getDividasFinanciamentos(sessionId),
    enabled: !!sessionId,
  });

  const { data: totalInfo } = useQuery({
    queryKey: ["divida_total", sessionId],
    queryFn: () => getDividaTotal(sessionId),
    enabled: !!sessionId,
  });

  const { data: primeiraInfo } = useQuery({
    queryKey: ["divida_primeira", sessionId],
    queryFn: () => getDividaPrimeira(sessionId),
    enabled: !!sessionId,
  });

  // Converter dados do financeiro para formato de dívidas
  const debts: Debt[] = financeData.map(item => ({
    id: item.id,
    session_id: item.session_id,
    tipo: item.divida === 'sim' ? 'divida' : 'financiamento',
    descricao: item.descricao || item.nome || 'Sem descrição',
    nome: item.nome,
    valor: item.valor,
    categoria: item.categoria,
    data_transacao: item.data_transacao,
    prazo: item.prazo,
    prazo_data: item.prazo_data,
    financiamento: item.financiamento,
    divida: item.divida,
    pago: item.pago,
    a_pagar: item.a_pagar,
  }));

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("financeiro_clientes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts_finance", sessionId] });
      toast.success("Dívida removida com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover dívida");
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: number; amount: number }) => {
      // Marcar como pago na tabela financeiro
      const { error: updateError } = await supabase
        .from("financeiro_clientes")
        .update({ 
          pago: 'sim',
          a_pagar: 'nao'
        })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      // Registrar transação de pagamento
      const nowIso = new Date().toISOString();
      await addFinanceiro({
        sessionId,
        type: "despesa",
        category: "Pagamento de Dívidas",
        value: amount,
        description: `Pagamento realizado`,
        dateIso: nowIso,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts_finance", sessionId] });
      toast.success("Pagamento registrado com sucesso!");
      setPaymentAmount("");
      setIsPaymentDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error("Erro ao registrar pagamento:", error);
      toast.error("Erro ao registrar pagamento. Tente novamente.");
    },
  });

  const handleAddPayment = () => {
    if (!selectedDebt) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    paymentMutation.mutate({ id: selectedDebt.id, amount });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "P", { locale: ptBR });
  };

  const calculateProgress = (debt: Debt) => {
    if (debt.pago === 'sim') return 100;
    if (debt.a_pagar === 'sim') return 0;
    return 50; // Parcialmente pago
  };

  const totalDividas = debts.filter(d => d.a_pagar === 'sim').reduce((sum, d) => sum + d.valor, 0);
  const totalPago = debts.filter(d => d.pago === 'sim').reduce((sum, d) => sum + d.valor, 0);
  const totalGeral = debts.reduce((sum, d) => sum + d.valor, 0);

  const calculateInstallmentInfo = (debt: Debt): InstallmentInfo => {
    // Se tem prazo_data, usar como vencimento
    let nextDueDate: Date | null = null;
    if (debt.prazo_data && debt.a_pagar === 'sim') {
      nextDueDate = new Date(debt.prazo_data);
    }
    
    // Valores padrão se não tiver parcelas definidas
    const total = 1;
    const paid = debt.pago === 'sim' ? 1 : 0;
    const remaining = debt.a_pagar === 'sim' ? 1 : 0;
    const valuePerInstallment = debt.valor;
    
    return { total, paid, remaining, valuePerInstallment, nextDueDate };
  };

  const syncDividaTotal = async () => {
    try {
      await upsertDividaTotal(sessionId, totalGeral);
      queryClient.invalidateQueries({ queryKey: ["divida_total", sessionId] });
      toast.success("Total de dívidas sincronizado");
    } catch (e) {
      toast.error("Falha ao sincronizar total");
    }
  };

  const syncDividaPrimeira = async () => {
    try {
      // pegar o próximo vencimento mais próximo entre dívidas a pagar
      const candidates = debts
        .map(d => ({ d, info: calculateInstallmentInfo(d) }))
        .filter(x => x.d.a_pagar === 'sim' && x.info.nextDueDate);
      const next = candidates.sort((a,b) => +a.info.nextDueDate! - +b.info.nextDueDate!)[0];
      const dateIso = next?.info.nextDueDate ? new Date(next.info.nextDueDate).toISOString() : null;
      const valor = next?.info.valuePerInstallment ?? null;
      await upsertDividaPrimeira(sessionId, dateIso, valor);
      queryClient.invalidateQueries({ queryKey: ["divida_primeira", sessionId] });
      toast.success("Primeira parcela sincronizada");
    } catch (e) {
      toast.error("Falha ao sincronizar primeira parcela");
    }
  };

  const handleEditDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDialogOpen(true);
  };

  const handleAddDebt = () => {
    setSelectedDebt(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Diálogo de Dívida */}
      <DebtDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        debt={selectedDebt as any}
        onSuccess={async () => {
          await refetch();
          await syncDividaTotal();
          await syncDividaPrimeira();
          setSelectedDebt(null);
        }}
      />

      {/* Diálogo de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Informe o valor do pagamento para {selectedDebt?.descricao}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentAmount">Valor do Pagamento</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Digite o valor"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Valor: {formatCurrency(selectedDebt?.valor || 0)}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPayment} disabled={!paymentAmount}>
              Registrar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header com Resumo */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Minhas Dívidas</h1>
          <Button onClick={handleAddDebt} className="shadow-luxury hover-lift">
            <Plus className="h-4 w-4 mr-2" />
            Nova Dívida
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Gerencie suas dívidas e acompanhe o progresso de pagamento</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-luxury hover-lift border-l-4 border-l-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Total a Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatCurrency(totalDividas)}</div>
            <p className="text-xs text-muted-foreground mt-1">{debts.length} dívida(s) ativa(s)</p>
          </CardContent>
        </Card>

        <Card className="shadow-luxury hover-lift border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatCurrency(totalPago)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalGeral > 0 ? `${((totalPago / totalGeral) * 100).toFixed(1)}%` : '0%'} do total
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-luxury hover-lift border-l-4 border-l-accent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalGeral)}</div>
            <p className="text-xs text-muted-foreground mt-1">Soma de todas as dívidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Integração com tabelas auxiliares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Total registrado (tabela divida_total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(totalInfo?.valor_total || 0))}</div>
            {totalInfo?.atualizado_em && (
              <p className="text-xs text-muted-foreground mt-1">Atualizado em {formatDate(String(totalInfo.atualizado_em))}</p>
            )}
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={syncDividaTotal}>Sincronizar com soma atual</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-luxury">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Primeira parcela (tabela divida_primeira)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {primeiraInfo?.primeira_parcela_em ? formatDate(String(primeiraInfo.primeira_parcela_em)) : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Valor: {formatCurrency(Number(primeiraInfo?.valor_primeira || 0))}</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={syncDividaPrimeira}>Definir pela próxima parcela</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Dívidas */}
      <div className="space-y-4">
            
        {isLoading ? (
          <Card className="shadow-luxury">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">Carregando dívidas...</div>
            </CardContent>
          </Card>
        ) : debts.length === 0 ? (
          <Card className="shadow-luxury">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <TrendingDown className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold">Nenhuma dívida cadastrada</h3>
                  <p className="text-sm text-muted-foreground mt-1">Clique em "Nova Dívida" para começar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          debts.map((debt) => {
            const installmentInfo = calculateInstallmentInfo(debt);
            const progressPercent = calculateProgress(debt);
            const isFullyPaid = progressPercent >= 100;
            
            return (
              <Card key={debt.id} className={`shadow-luxury-lg hover-lift transition-all duration-300 ${
                isFullyPaid ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-destructive'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {debt.descricao}
                        {isFullyPaid && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                      </CardTitle>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {debt.prazo_data && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Vence em {formatDate(debt.prazo_data)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {debt.divida === 'sim' ? 'Dívida' : 'Financiamento'}
                          </span>
                        </div>
                        {debt.categoria && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs">Categoria: {debt.categoria}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          setSelectedDebt(debt);
                          setIsPaymentDialogOpen(true);
                        }}
                        disabled={isFullyPaid}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-blue-500/10 hover:text-blue-500"
                        onClick={() => handleEditDebt(debt)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja remover esta dívida?")) {
                            deleteMutation.mutate(debt.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progresso Visual */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Progresso do Pagamento</span>
                      <span className="font-bold">{progressPercent.toFixed(1)}%</span>
                    </div>
                    <div className="relative w-full bg-secondary rounded-full h-3 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500 animate-gradient"
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{debt.pago === 'sim' ? 'Pago' : debt.a_pagar === 'sim' ? 'A pagar' : 'Parcial'}</span>
                      <span>{formatCurrency(debt.valor)}</span>
                    </div>
                  </div>

                  {/* Informações de Parcelas */}
                  {debt.prazo === 'sim' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Total de Parcelas
                        </p>
                        <p className="text-lg font-bold">{installmentInfo.total}x</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Pagas
                        </p>
                        <p className="text-lg font-bold text-green-600">{installmentInfo.paid}x</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Faltam
                        </p>
                        <p className="text-lg font-bold text-destructive">{installmentInfo.remaining}x</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Valor/Parcela
                        </p>
                        <p className="text-lg font-bold">{formatCurrency(installmentInfo.valuePerInstallment)}</p>
                      </div>
                    </div>
                  )}

                  {/* Próximo Vencimento */}
                  {installmentInfo.nextDueDate && installmentInfo.remaining > 0 && (
                    <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium">Próximo Vencimento</p>
                          <p className="text-xs text-muted-foreground">
                            {format(installmentInfo.nextDueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(installmentInfo.valuePerInstallment)}</p>
                      </div>
                    </div>
                  )}

                  {/* Valores Totais */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Valor</p>
                      <p className="text-sm font-bold">{formatCurrency(debt.valor)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-bold">
                        {debt.pago === 'sim' ? (
                          <span className="text-green-600">✓ Pago</span>
                        ) : debt.a_pagar === 'sim' ? (
                          <span className="text-destructive">⚠ A Pagar</span>
                        ) : (
                          <span className="text-amber-600">⏳ Parcial</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OnlyDebtsTab;
