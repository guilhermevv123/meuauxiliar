import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import AdminLayout from "./AdminLayout";

const Sales = () => {
  const [sales, setSales] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("clientes_meu_auxiliar")
        .select("vip, VIP, created_at");
      if (error || !data) return;
      const now = new Date();
      const m = now.getMonth();
      const y = now.getFullYear();
      const cnt = (data as any[]).filter((r) => {
        const v = (r.vip ?? r.VIP ?? "").toString().toLowerCase() === "sim";
        const dt = r.created_at ? new Date(r.created_at) : null;
        if (!v) return false;
        if (!dt) return true;
        return dt.getMonth() === m && dt.getFullYear() === y;
      }).length;
      setSales(cnt);
    })();
  }, []);

  return (
    <AdminLayout>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas no Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{sales}</div>
            <p className="text-xs text-muted-foreground mt-2">Novos VIPs no mês</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Sales;

