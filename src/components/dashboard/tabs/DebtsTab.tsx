import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, CreditCard, TrendingDown, DollarSign } from "lucide-react";
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
import { addFinanceiro } from "@/lib/api";

type Debt = {
  id: string;
  session_id: string;
  tipo: "divida" | "financiamento";
  descricao: string;
  valor_total: number;
  valor_pago: number;
  data_inicio: string;
  data_vencimento: string;
  parcelas_total?: number;
  parcelas_pagas?: number;
  taxa_juros?: number;
  criado_em: string;
};

export const DebtsTab = () => {
  const sessionId = getSession()?.sessionId ?? "";
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");

  const { data: debts = [], isLoading, refetch } = useQuery({
    queryKey: ["debts", sessionId],
    queryFn: async () => {
      const sessionIdNum = BigInt(sessionId);
      const { data, error } = await supabase
        .from("dividas_financiamentos")
        .select("*")
        .eq("session_id", sessionIdNum.toString())
        .order("data_vencimento", { ascending: true });
      
      if (error) throw error;
      return (data || []) as Debt[];
    },
    enabled: !!sessionId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dividas_financiamentos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", sessionId] });
      toast.success("Item removido com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover item");
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data: debt, error: fetchError } = await supabase
        .from("dividas_financiamentos")
        .select("*")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newPaidAmount = (debt.valor_pago || 0) + amount;
      const isFullyPaid = newPaidAmount >= debt.valor_total;
      
      const { error: updateError } = await supabase
        .from("dividas_financiamentos")
        .update({ 
          valor_pago: newPaidAmount,
          ...(isFullyPaid && { parcelas_pagas: debt.parcelas_total ?? debt.parcelas_pagas, })
        })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      // Registrar transação de pagamento (saida) no financeiro
      const nowIso = new Date().toISOString();
      await addFinanceiro({
        sessionId,
        type: "despesa",
        category: "Pagamento de Dívidas",
        value: amount,
        description: `Pagamento: ${debt.descricao}`,
        dateIso: nowIso,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts", sessionId] });
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

  const calculateProgress = (pago: number, total: number) => {
    return (pago / total) * 100;
  };

  const dividas = debts.filter((d) => d.tipo === "divida");
  const financiamentos = debts.filter((d) => d.tipo === "financiamento");

  const totalDividas = dividas.reduce((sum, d) => sum + (d.valor_total - d.valor_pago), 0);
  const totalFinanciamentos = financiamentos.reduce((sum, d) => sum + (d.valor_total - d.valor_pago), 0);

  const handleEditDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsDialogOpen(true);
  };

  const handleAddDebt = () => {
    setSelectedDebt(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Diálogo de Dívida */}
      <DebtDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        debt={selectedDebt as any}
        onSuccess={() => {
          refetch();
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
                  Valor restante: {formatCurrency((selectedDebt?.valor_total || 0) - (selectedDebt?.valor_pago || 0))}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddPayment}
              disabled={!paymentAmount || paymentMutation.isPending}
            >
              {paymentMutation.isPending ? "Salvando..." : "Registrar Pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Dívidas</p>
                <p className="text-2xl font-bold text-red-500">
                  {formatCurrency(totalDividas)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dividas.length} dívida(s) ativa(s)
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total em Financiamentos</p>
                <p className="text-2xl font-bold text-orange-500">
                  {formatCurrency(totalFinanciamentos)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {financiamentos.length} financiamento(s) ativo(s)
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dívidas */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Dívidas</CardTitle>
            <Button size="sm" onClick={handleAddDebt}>
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Dívida
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {dividas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma dívida cadastrada
            </p>
          ) : (
            <div className="space-y-4">
              {dividas.map((debt) => {
                const restante = debt.valor_total - debt.valor_pago;
                const progress = calculateProgress(debt.valor_pago, debt.valor_total);
                
                return (
                  <div
                    key={debt.id}
                    className="p-4 rounded-lg border bg-muted/30 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {debt.descricao}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {formatDate(debt.data_vencimento)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditDebt(debt)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedDebt(debt); setIsPaymentDialogOpen(true); }}
                          className="h-8 w-8 p-0 text-green-500 hover:text-green-600"
                          title="Registrar Pagamento"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(debt.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          title="Excluir Dívida"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(debt.valor_pago)} / {formatCurrency(debt.valor_total)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-red-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Restante</span>
                        <span className="font-bold text-red-500">
                          {formatCurrency(restante)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financiamentos */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Financiamentos</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Financiamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {financiamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum financiamento cadastrado
            </p>
          ) : (
            <div className="space-y-4">
              {financiamentos.map((debt) => {
                const restante = debt.valor_total - debt.valor_pago;
                const progress = calculateProgress(debt.valor_pago, debt.valor_total);
                
                return (
                  <div
                    key={debt.id}
                    className="p-4 rounded-lg border bg-muted/30 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">
                          {debt.descricao}
                        </h3>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                          <span>Vencimento: {formatDate(debt.data_vencimento)}</span>
                          {debt.parcelas_total && (
                            <span>
                              Parcelas: {debt.parcelas_pagas || 0}/{debt.parcelas_total}
                            </span>
                          )}
                          {debt.taxa_juros && (
                            <span>Juros: {debt.taxa_juros}%</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(debt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(debt.valor_pago)} / {formatCurrency(debt.valor_total)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-orange-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Restante</span>
                        <span className="font-bold text-orange-500">
                          {formatCurrency(restante)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
