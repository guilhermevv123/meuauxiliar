import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import AdminLayout from "./AdminLayout";

const Conversion = () => {
  const [rate, setRate] = useState(0);

  useEffect(() => {
    (async () => {
      const testeRes = await supabase.from("clientes_meu_auxiliar").select("status, plano");
      const vipRes = await supabase.from("clientes_meu_auxiliar").select("vip, VIP");
      const teste = (testeRes.data || []).filter((r: any) => (r.status === "teste" || r.plano === "teste")).length;
      const vip = (vipRes.data || []).filter((r: any) => ((r.vip ?? r.VIP ?? "").toString().toLowerCase() === "sim")).length;
      const base = teste + vip;
      const pct = base > 0 ? Math.round((vip / base) * 100) : 0;
      setRate(pct);
    })();
  }, []);

  return (
    <AdminLayout>
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold">{rate}%</div>
            <p className="text-xs text-muted-foreground mt-2">Teste → Assinatura (VIP)</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Conversion;

