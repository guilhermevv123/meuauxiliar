import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import AdminLayout from "./AdminLayout";

const Billing = () => {
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("financeiro_clientes")
        .select("valor, created_at, data");
      if (error || !data) return;
      const now = new Date();
      const m = now.getMonth();
      const y = now.getFullYear();
      const sum = (data as any[])
        .filter((r) => {
          const dt = r.created_at ? new Date(r.created_at) : (r.data ? new Date(r.data) : null);
          if (!dt) return false;
          return dt.getMonth() === m && dt.getFullYear() === y;
        })
        .reduce((acc, r) => acc + (Number(r.valor) || 0), 0);
      setRevenue(Math.round(sum));
    })();
  }, []);

  return (
    <AdminLayout>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">R$ {revenue.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground mt-2">Mês atual</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Billing;

