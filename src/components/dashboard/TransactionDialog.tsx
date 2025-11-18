import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { addCategoria, seedCategoriasIfEmpty } from "@/lib/api";
import { getSession } from "@/lib/session";
import { toast } from "sonner";

interface Transaction {
  id: number;
  type: "receita" | "despesa";
  description: string;
  category: string;
  date: string;
  value: number;
  transacao_fixa?: string;
}

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: number }) => void;
}

export const TransactionDialog = ({ open, onOpenChange, transaction, onSave }: TransactionDialogProps) => {
  const parseDate = (dateStr?: string): Date => {
    if (!dateStr) return new Date();
    try {
      const [dd, mm, yyyy] = dateStr.split('/');
      return new Date(`${yyyy}-${mm}-${dd}`);
    } catch {
      return new Date();
    }
  };

  const [formData, setFormData] = useState({
    type: transaction?.type || "receita" as "receita" | "despesa",
    description: transaction?.description || "",
    category: transaction?.category || "",
    value: transaction ? Math.abs(transaction.value) : 0,
    date: parseDate(transaction?.date),
    transacao_fixa: transaction?.transacao_fixa || "nao",
  });

  const sessionId = getSession()?.sessionId ?? "";
  const { data: categorias = [], refetch } = useQuery({
    queryKey: ["categorias", sessionId, formData.type],
    queryFn: () => seedCategoriasIfEmpty(sessionId, formData.type),
    enabled: !!sessionId,
  });

  useEffect(() => { refetch(); }, [formData.type, refetch]);
  
  // Atualizar formData quando transaction mudar
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        description: transaction.description,
        category: transaction.category,
        value: Math.abs(transaction.value),
        date: parseDate(transaction.date),
        transacao_fixa: transaction.transacao_fixa || "nao",
      });
    } else {
      setFormData({
        type: "receita",
        description: "",
        category: "",
        value: 0,
        date: new Date(),
        transacao_fixa: "nao",
      });
    }
  }, [transaction]);
  
  const categoryOptions = useMemo(() => categorias.map(c => c.name), [categorias]);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleSubmit = () => {
    try {
      onSave({
        id: transaction?.id,
        type: formData.type,
        description: formData.description,
        category: formData.category,
        date: format(formData.date, "dd/MM/yyyy", { locale: ptBR }),
        value: formData.type === "despesa" ? -Math.abs(formData.value) : Math.abs(formData.value),
        transacao_fixa: formData.transacao_fixa,
      });
      onOpenChange(false);
      toast.success("Transação salva com sucesso");
    } catch (e) {
      toast.error("Falha ao salvar a transação");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={formData.type} onValueChange={(value: "receita" | "despesa") => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            {!creatingCategory ? (
              <div className="flex gap-2">
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" variant="outline" onClick={() => { setCreatingCategory(true); setNewCategory(""); }}>+ Nova</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input placeholder="Nome da categoria" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                <Button type="button" onClick={async () => {
                  if (!newCategory.trim()) { toast.error("Informe um nome"); return; }
                  try {
                    const created = await addCategoria({ sessionId, name: newCategory.trim(), type: formData.type });
                    toast.success("Categoria criada");
                    setFormData({ ...formData, category: created.name });
                    setCreatingCategory(false);
                    refetch();
                  } catch {
                    toast.error("Falha ao criar categoria");
                  }
                }}>Salvar</Button>
                <Button type="button" variant="outline" onClick={() => setCreatingCategory(false)}>Cancelar</Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })} />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="transacao-fixa" 
              checked={formData.transacao_fixa === "sim"}
              onCheckedChange={(checked) => setFormData({ ...formData, transacao_fixa: checked ? "sim" : "nao" })}
            />
            <Label htmlFor="transacao-fixa" className="text-sm font-normal cursor-pointer">
              Transação fixa (repetir mensalmente)
            </Label>
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={formData.date} onSelect={(date) => date && setFormData({ ...formData, date })} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
