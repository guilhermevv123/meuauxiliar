import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { ArrowUpCircle, ArrowDownCircle, Plus, Pencil, Trash2, Filter, CheckCircle2, Clock, XCircle } from "lucide-react";
import { TransactionDialog } from "../TransactionDialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addFinanceiro, deleteFinanceiro, getFinanceiroByMonth, updateFinanceiro, togglePagoStatus, toggleRecebidoStatus } from "@/lib/api";
import { getSession } from "@/lib/session";
import { toast } from "sonner";
import { PeriodSelector } from "../PeriodSelector";

type UITx = { id: number; type: "receita" | "despesa"; description: string; category: string; date: string; value: number; pago?: string; recebido?: string; transacao_fixa?: string };

export const TransactionsTab = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const sessionId = getSession()?.sessionId ?? "";
  const queryClient = useQueryClient();
  
  console.log("💳 TransactionsTab - Info:", { sessionId, month, year });
  
  const { data: rows = [], refetch, isLoading, error } = useQuery({
    queryKey: ["financeiro-list", sessionId, year, month],
    queryFn: () => getFinanceiroByMonth(sessionId, year, month),
    enabled: !!sessionId,
  });
  
  console.log("💳 TransactionsTab - Data:", { 
    rows, 
    count: rows.length, 
    isLoading, 
    error 
  });
  
  const initialTransactions: UITx[] = useMemo(() => {
    const txs = (rows || []).map(r => ({
      id: r.id,
      type: (r.tipo === "entrada" ? "receita" : "despesa") as "receita" | "despesa",
      description: r.descricao || "",
      category: r.categoria || "",
      date: format(new Date(r.data_transacao), "dd/MM/yyyy", { locale: ptBR }),
      value: r.tipo === "entrada" ? Math.abs(r.valor) : -Math.abs(r.valor),
      pago: r.pago,
      recebido: r.recebido,
      transacao_fixa: r.transacao_fixa,
    }));
    console.log("💳 TransactionsTab - Transactions:", { txs, count: txs.length });
    return txs;
  }, [rows]);
  const [transactions, setTransactions] = useState<UITx[]>(initialTransactions);
  useEffect(() => { setTransactions(initialTransactions); }, [initialTransactions]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<UITx | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState<Date | undefined>();

  // Mutations para toggle de status
  const togglePagoMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: number; currentStatus: string | undefined }) => 
      togglePagoStatus(id, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeiro-list", sessionId, year, month] });
      queryClient.invalidateQueries({ queryKey: ["financeiro", sessionId, year, month] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    }
  });

  const toggleRecebidoMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: number; currentStatus: string | undefined }) => 
      toggleRecebidoStatus(id, currentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financeiro-list", sessionId, year, month] });
      queryClient.invalidateQueries({ queryKey: ["financeiro", sessionId, year, month] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status");
    }
  });

  const handleSave = async (transaction: Omit<UITx, 'id'> & { id?: number }) => {
    // Convert UI to API schema
    const [dd, mm, yyyy] = transaction.date.split('/');
    const dateIso = new Date(`${yyyy}-${mm}-${dd}T00:00:00`).toISOString();
    if (transaction.id) {
      await updateFinanceiro(transaction.id, {
        category: transaction.category,
        type: transaction.type,
        value: Math.abs(transaction.value),
        description: transaction.description,
        dateIso,
        transacao_fixa: transaction.transacao_fixa,
      });
      setTransactions(transactions.map(t => t.id === transaction.id ? { ...(transaction as UITx), id: transaction.id } : t));
    } else {
      const created = await addFinanceiro({
        sessionId,
        type: transaction.type,
        category: transaction.category,
        value: Math.abs(transaction.value),
        description: transaction.description,
        dateIso,
        transacao_fixa: transaction.transacao_fixa,
      });
      setTransactions([...transactions, {
        id: created.id,
        type: created.tipo === 'entrada' ? 'receita' : 'despesa',
        description: created.descricao || '',
        category: created.categoria || '',
        date: format(new Date(created.data_transacao), "dd/MM/yyyy", { locale: ptBR }),
        value: created.tipo === 'entrada' ? Math.abs(created.valor) : -Math.abs(created.valor),
      }]);
    }
    setEditingTransaction(undefined);
    refetch();
  };

  const handleEdit = (transaction: typeof initialTransactions[0]) => {
    setEditingTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteFinanceiro(transactionToDelete).catch(() => {}).finally(() => {
        setTransactions(transactions.filter(t => t.id !== transactionToDelete));
        refetch();
      });
      setTransactionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const filteredTransactions = filterDate
    ? transactions.filter(t => t.date === format(filterDate, "dd/MM/yyyy", { locale: ptBR }))
    : transactions;

  // Função para renderizar o badge de status (clicável)
  const renderStatusBadge = (transaction: UITx) => {
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation(); // Evitar trigger de edição
      if (transaction.type === 'despesa') {
        togglePagoMutation.mutate({ id: transaction.id, currentStatus: transaction.pago });
      } else {
        toggleRecebidoMutation.mutate({ id: transaction.id, currentStatus: transaction.recebido });
      }
    };

    if (transaction.type === 'despesa') {
      // Para despesas, verificar se foi pago
      // 'sim' = já pago, 'nao' ou vazio/null = a pagar
      if (transaction.pago === 'sim') {
        return (
          <Badge 
            className="bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/40 border-green-500/30 cursor-pointer transition-all"
            onClick={handleToggle}
            title="Clique para marcar como A Pagar"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        );
      } else {
        // 'nao' ou vazio = A Pagar
        return (
          <Badge 
            className="bg-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/40 border-amber-500/30 cursor-pointer transition-all"
            onClick={handleToggle}
            title="Clique para marcar como Pago"
          >
            <Clock className="h-3 w-3 mr-1" />
            A Pagar
          </Badge>
        );
      }
    } else {
      // Para receitas, verificar se foi recebido
      // 'sim' = já recebido, 'nao' ou vazio/null = a receber
      if (transaction.recebido === 'sim') {
        return (
          <Badge 
            className="bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/40 border-blue-500/30 cursor-pointer transition-all"
            onClick={handleToggle}
            title="Clique para marcar como A Receber"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Recebido
          </Badge>
        );
      } else {
        // 'nao' ou vazio = A Receber
        return (
          <Badge 
            className="bg-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-500/40 border-purple-500/30 cursor-pointer transition-all"
            onClick={handleToggle}
            title="Clique para marcar como Recebido"
          >
            <Clock className="h-3 w-3 mr-1" />
            A Receber
          </Badge>
        );
      }
    }
  };

  return (
    <>
      <div className="mb-4">
        <PeriodSelector month={month} year={year} onChangeMonth={setMonth} onChangeYear={setYear} />
      </div>
      <Card className="bg-card border-border shadow-luxury">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-foreground text-base sm:text-lg">Transações Recentes</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{filterDate ? format(filterDate, "dd/MM/yyyy", { locale: ptBR }) : "Filtrar por Data"}</span>
                    <span className="sm:hidden">{filterDate ? format(filterDate, "dd/MM", { locale: ptBR }) : "Data"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar 
                    mode="single" 
                    selected={filterDate} 
                    onSelect={setFilterDate}
                    className="pointer-events-auto" 
                  />
                  {filterDate && (
                    <div className="p-2 border-t">
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setFilterDate(undefined)}>
                        Limpar Filtro
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <Button onClick={() => { setEditingTransaction(undefined); setDialogOpen(true); }} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Adicionar</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors gap-3"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className={`p-1.5 sm:p-2 rounded-full ${transaction.type === 'receita' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {transaction.type === 'receita' ? (
                    <ArrowUpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground text-sm sm:text-base truncate">{transaction.description}</p>
                    {renderStatusBadge(transaction)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                <p className={`font-bold text-base sm:text-lg ${transaction.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(Math.abs(transaction.value))}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(transaction)} className="h-8 w-8 p-0">
                    <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(transaction.id)} className="h-8 w-8 p-0">
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <TransactionDialog 
      open={dialogOpen} 
      onOpenChange={setDialogOpen} 
      transaction={editingTransaction} 
      onSave={handleSave} 
    />

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
