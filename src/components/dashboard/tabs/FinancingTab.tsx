import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, Home, Car, Bike, Calculator, DollarSign, Calendar, TrendingUp } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSession } from "@/lib/session";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { DebtDialog } from "../DebtDialog";
import { format, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addFinanceiro } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Financing = {
  id: string;
  session_id: string;
  tipo: "divida" | "financiamento";
  descricao: string;
  categoria?: "casa" | "carro" | "moto" | "outro";
  valor_total: number;
  valor_pago: number;
  data_inicio: string;
  data_vencimento: string;
  parcelas_total?: number;
  parcelas_pagas?: number;
  taxa_juros?: number;
  criado_em: string;
};

export const FinancingTab = () => {
  // Estados principais
  const sessionId = getSession()?.sessionId ?? "";
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFinancing, setSelectedFinancing] = useState<Financing | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  
  // Estados do simulador
  const [simValorTotal, setSimValorTotal] = useState("");
  const [simTaxaJuros, setSimTaxaJuros] = useState("");
  const [simParcelas, setSimParcelas] = useState("");

  const { data: financings = [], isLoading, refetch } = useQuery({
    queryKey: ["financings", sessionId],
    queryFn: async () => {
      const sessionIdNum = BigInt(sessionId);
      const { data, error } = await supabase
        .from("dividas_financiamentos")
        .select("*")
        .eq("session_id", sessionIdNum.toString())
        .eq("tipo", "financiamento")
        .order("data_vencimento", { ascending: true });
      
      if (error) throw error;
      return (data || []) as Financing[];
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
      queryClient.invalidateQueries({ queryKey: ["financings", sessionId] });
      toast.success("Financiamento removido com sucesso");
    },
    onError: () => {
      toast.error("Erro ao remover financiamento");
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { data: financing, error: fetchError } = await supabase
        .from("dividas_financiamentos")
        .select("*")
        .eq("id", id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newPaidAmount = (financing.valor_pago || 0) + amount;
      const newPaidInstallments = financing.parcelas_pagas ? financing.parcelas_pagas + 1 : 1;
      const isFullyPaid = newPaidAmount >= financing.valor_total;
      
      const { error: updateError } = await supabase
        .from("dividas_financiamentos")
        .update({ 
          valor_pago: newPaidAmount,
          parcelas_pagas: isFullyPaid ? financing.parcelas_total : newPaidInstallments
        })
        .eq("id", id);
      
      if (updateError) throw updateError;
      
      // Registrar transação de pagamento (saida) no financeiro
      const nowIso = new Date().toISOString();
      await addFinanceiro({
        sessionId,
        type: "despesa",
        category: "Pagamento de Financiamento",
        value: amount,
        description: `Parcela: ${financing.descricao}`,
        dateIso: nowIso,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financings", sessionId] });
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
    if (!selectedFinancing) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    paymentMutation.mutate({ id: selectedFinancing.id, amount });
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

  // Cálculo do simulador (Sistema Price - Tabela Price)
  const simulacao = useMemo(() => {
    const valor = parseFloat(simValorTotal);
    const taxa = parseFloat(simTaxaJuros) / 100; // taxa mensal
    const n = parseInt(simParcelas);
    
    if (isNaN(valor) || isNaN(taxa) || isNaN(n) || valor <= 0 || n <= 0) {
      return null;
    }
    
    // Fórmula da Tabela Price: PMT = PV * (i * (1 + i)^n) / ((1 + i)^n - 1)
    const parcela = taxa === 0 
      ? valor / n 
      : (valor * (taxa * Math.pow(1 + taxa, n))) / (Math.pow(1 + taxa, n) - 1);
    
    const totalPago = parcela * n;
    const totalJuros = totalPago - valor;
    
    return {
      valorParcela: parcela,
      totalPago,
      totalJuros,
      valorFinanciado: valor,
    };
  }, [simValorTotal, simTaxaJuros, simParcelas]);

  // Agrupar financiamentos por categoria
  const financingsByCategory = useMemo(() => {
    return {
      casa: financings.filter(f => f.categoria === "casa"),
      carro: financings.filter(f => f.categoria === "carro"),
      moto: financings.filter(f => f.categoria === "moto"),
      outro: financings.filter(f => !f.categoria || f.categoria === "outro"),
    };
  }, [financings]);

  const totalFinanciamentos = financings.reduce((sum, f) => sum + (f.valor_total - f.valor_pago), 0);
  const totalPago = financings.reduce((sum, f) => sum + f.valor_pago, 0);
  const parcelasEmAberto = financings.reduce((sum, f) => {
    const total = f.parcelas_total || 0;
    const pagas = f.parcelas_pagas || 0;
    return sum + (total - pagas);
  }, 0);

  const handleEditFinancing = (financing: Financing) => {
    setSelectedFinancing(financing);
    setIsDialogOpen(true);
  };

  const handleAddFinancing = () => {
    setSelectedFinancing(null);
    setIsDialogOpen(true);
  };
  
  const getCategoryIcon = (categoria?: string) => {
    switch (categoria) {
      case "casa": return <Home className="h-5 w-5" />;
      case "carro": return <Car className="h-5 w-5" />;
      case "moto": return <Bike className="h-5 w-5" />;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };
  
  const getCategoryLabel = (categoria?: string) => {
    switch (categoria) {
      case "casa": return "Casa";
      case "carro": return "Carro";
      case "moto": return "Moto";
      default: return "Outro";
    }
  };

  const renderFinancingList = (list: Financing[]) => {
    if (isLoading) {
      return <div className="text-center py-8">Carregando...</div>;
    }

    if (list.length === 0) {
      return (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Nenhum financiamento cadastrado nesta categoria
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {list.map((financing) => (
          <Card key={financing.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(financing.categoria)}
                  <div>
                    <CardTitle className="text-lg">{financing.descricao}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryLabel(financing.categoria)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setSelectedFinancing(financing);
                      setIsPaymentDialogOpen(true);
                    }}
                    title="Pagar Parcela"
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditFinancing(financing)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja remover este financiamento?")) {
                        deleteMutation.mutate(financing.id);
                      }
                    }}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Total:</span>
                  <span className="font-semibold">{formatCurrency(financing.valor_total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor Pago:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(financing.valor_pago)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo Devedor:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(financing.valor_total - financing.valor_pago)}
                  </span>
                </div>
                
                {financing.parcelas_total && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Parcelas:</span>
                    <span className="font-semibold">
                      {financing.parcelas_pagas || 0} / {financing.parcelas_total}
                    </span>
                  </div>
                )}
                
                {financing.taxa_juros && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de Juros:</span>
                    <span className="font-semibold">{financing.taxa_juros}% a.m.</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vencimento:</span>
                  <span className="font-semibold">{formatDate(financing.data_vencimento)}</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progresso</span>
                    <span>{calculateProgress(financing.valor_pago, financing.valor_total).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          calculateProgress(financing.valor_pago, financing.valor_total),
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Diálogo de Financiamento */}
      <DebtDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        debt={selectedFinancing as any}
        onSuccess={() => {
          refetch();
          setSelectedFinancing(null);
        }}
        defaultType="financiamento"
      />

      {/* Diálogo de Pagamento */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Informe o valor do pagamento para {selectedFinancing?.descricao}
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
                  Valor restante: {formatCurrency((selectedFinancing?.valor_total || 0) - (selectedFinancing?.valor_pago || 0))}
                </p>
                {selectedFinancing?.parcelas_total && (
                  <p className="text-sm text-muted-foreground">
                    Parcelas: {selectedFinancing?.parcelas_pagas || 0} de {selectedFinancing?.parcelas_total}
                  </p>
                )}
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

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Saldo Devedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(totalFinanciamentos)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(totalPago)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Parcelas em Aberto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {parcelasEmAberto}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Total de Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {financings.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulador de Financiamento */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Simulador de Financiamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="simValorTotal">Valor Total (R$)</Label>
              <Input
                id="simValorTotal"
                type="number"
                step="0.01"
                value={simValorTotal}
                onChange={(e) => setSimValorTotal(e.target.value)}
                placeholder="Ex: 50000"
              />
            </div>
            <div>
              <Label htmlFor="simTaxaJuros">Taxa de Juros (% a.m.)</Label>
              <Input
                id="simTaxaJuros"
                type="number"
                step="0.01"
                value={simTaxaJuros}
                onChange={(e) => setSimTaxaJuros(e.target.value)}
                placeholder="Ex: 1.5"
              />
            </div>
            <div>
              <Label htmlFor="simParcelas">Número de Parcelas</Label>
              <Input
                id="simParcelas"
                type="number"
                value={simParcelas}
                onChange={(e) => setSimParcelas(e.target.value)}
                placeholder="Ex: 60"
              />
            </div>
          </div>

          {simulacao && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Valor da Parcela</p>
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(simulacao.valorParcela)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total a Pagar</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(simulacao.totalPago)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total de Juros</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(simulacao.totalJuros)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Valor Financiado</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(simulacao.valorFinanciado)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs de Categorias */}
      <Tabs defaultValue="todos" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="casa" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Casa
            </TabsTrigger>
            <TabsTrigger value="carro" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Carro
            </TabsTrigger>
            <TabsTrigger value="moto" className="flex items-center gap-2">
              <Bike className="h-4 w-4" />
              Moto
            </TabsTrigger>
          </TabsList>
          <Button onClick={handleAddFinancing}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Financiamento
          </Button>
        </div>

        <TabsContent value="todos">
          {renderFinancingList(financings)}
        </TabsContent>
        <TabsContent value="casa">
          {renderFinancingList(financingsByCategory.casa)}
        </TabsContent>
        <TabsContent value="carro">
          {renderFinancingList(financingsByCategory.carro)}
        </TabsContent>
        <TabsContent value="moto">
          {renderFinancingList(financingsByCategory.moto)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancingTab;