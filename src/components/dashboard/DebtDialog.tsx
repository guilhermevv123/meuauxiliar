import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, addMonths, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const debtSchema = z.object({
  descricao: z.string().min(3, "Mínimo 3 caracteres"),
  tipo: z.enum(["divida", "financiamento"]),
  categoria: z.enum(["casa", "carro", "moto", "outro"]).optional(),
  valor_total: z.number({ invalid_type_error: "Informe um valor" }).min(0.01, "Valor deve ser maior que zero"),
  valor_pago: z.number({ invalid_type_error: "Informe um valor" }).min(0, "Valor não pode ser negativo").optional().default(0),
  data_inicio: z.date(),
  data_vencimento: z.date(),
  parcelas_total: z.number({ invalid_type_error: "Informe o número de parcelas" }).min(1, "Mínimo 1 parcela").optional(),
  taxa_juros: z.number({ invalid_type_error: "Informe a taxa" }).min(0, "Taxa não pode ser negativa").optional(),
});

type DebtFormValues = z.infer<typeof debtSchema>;

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt?: any;
  onSuccess?: () => void;
}

export function DebtDialog({ open, onOpenChange, debt, onSuccess }: DebtDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = getSession()?.sessionId ?? "";

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      tipo: "divida",
      categoria: "outro",
      valor_total: 0,
      valor_pago: 0,
      data_inicio: new Date(),
      data_vencimento: addMonths(new Date(), 1),
      parcelas_total: 1,
      taxa_juros: 0,
    },
  });

  // Preencher formulário ao editar
  useEffect(() => {
    if (debt) {
      const di = debt.data_inicio ? parseISO(String(debt.data_inicio)) : new Date();
      const dv = debt.data_vencimento ? parseISO(String(debt.data_vencimento)) : addMonths(new Date(), 1);
      form.reset({
        ...debt,
        data_inicio: isValid(di) ? di : new Date(),
        data_vencimento: isValid(dv) ? dv : addMonths(new Date(), 1),
      });
    } else {
      form.reset({
        tipo: "divida",
        categoria: "outro",
        valor_total: 0,
        valor_pago: 0,
        data_inicio: new Date(),
        data_vencimento: addMonths(new Date(), 1),
        parcelas_total: 1,
        taxa_juros: 0,
      });
    }
  }, [debt, form]);

  const tipo = form.watch("tipo");

  const onSubmit = async (data: DebtFormValues) => {
    try {
      setIsLoading(true);
      const sessionIdNum = BigInt(sessionId);
      const payload = {
        ...data,
        session_id: sessionIdNum.toString(),
        valor_total: Number(data.valor_total),
        valor_pago: Number(data.valor_pago ?? 0),
        parcelas_total: tipo === "financiamento" ? Number(data.parcelas_total) : 1,
        taxa_juros: tipo === "financiamento" ? Number(data.taxa_juros) : 0,
        data_inicio: data.data_inicio.toISOString(),
        data_vencimento: data.data_vencimento.toISOString(),
      } as any;

      if (debt) {
        // Atualizar dívida existente
        const { error } = await supabase
          .from("dividas_financiamentos")
          .update(payload)
          .eq("id", debt.id);

        if (error) throw new Error(error.message);
        toast.success("Dívida atualizada com sucesso!");
      } else {
        // Criar nova dívida
        const { error } = await supabase
          .from("dividas_financiamentos")
          .insert([payload]);

        if (error) throw new Error(error.message);
        toast.success("Dívida adicionada com sucesso!");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao salvar dívida:", error);
      toast.error("Erro ao salvar dívida: " + (error?.message ?? "Tente novamente."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", !open && "hidden")}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-md bg-card p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {debt ? "Editar Dívida" : "Nova Dívida"}
        </h2>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select
              onValueChange={(value: "divida" | "financiamento") => form.setValue("tipo", value)}
              value={form.watch("tipo")}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="divida">Dívida</SelectItem>
                <SelectItem value="financiamento">Financiamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === "financiamento" && (
            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                onValueChange={(value: "casa" | "carro" | "moto" | "outro") => form.setValue("categoria", value)}
                value={form.watch("categoria")}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">🏠 Casa</SelectItem>
                  <SelectItem value="carro">🚗 Carro</SelectItem>
                  <SelectItem value="moto">🏍️ Moto</SelectItem>
                  <SelectItem value="outro">📦 Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              {...form.register("descricao")}
              placeholder="Ex: Cartão de Crédito, Empréstimo, etc."
              disabled={isLoading}
            />
            {form.formState.errors.descricao && (
              <p className="text-sm text-red-500">
                {form.formState.errors.descricao.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_total">Valor Total</Label>
              <Input
                id="valor_total"
                type="number"
                step="0.01"
                {...form.register("valor_total", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.valor_total && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.valor_total.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="valor_pago">Valor Pago</Label>
              <Input
                id="valor_pago"
                type="number"
                step="0.01"
                {...form.register("valor_pago", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.valor_pago && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.valor_pago.message}
                </p>
              )}
            </div>
          </div>

          {tipo === "financiamento" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parcelas_total">Nº de Parcelas</Label>
                <Input
                  id="parcelas_total"
                  type="number"
                  min="1"
                  {...form.register("parcelas_total", { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {form.formState.errors.parcelas_total && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.parcelas_total.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="taxa_juros">Taxa de Juros (% a.m.)</Label>
                <Input
                  id="taxa_juros"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register("taxa_juros", { valueAsNumber: true })}
                  disabled={isLoading}
                />
                {form.formState.errors.taxa_juros && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.taxa_juros.message}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("data_inicio") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("data_inicio") ? (
                      (isValid(form.watch("data_inicio")) 
                        ? format(form.watch("data_inicio"), "PPP", { locale: ptBR }) 
                        : "Selecione uma data")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("data_inicio")}
                    onSelect={(date) => date && form.setValue("data_inicio", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("data_vencimento") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("data_vencimento") ? (
                      (isValid(form.watch("data_vencimento")) 
                        ? format(form.watch("data_vencimento"), "PPP", { locale: ptBR }) 
                        : "Selecione uma data")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("data_vencimento")}
                    onSelect={(date) => date && form.setValue("data_vencimento", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {debt ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
