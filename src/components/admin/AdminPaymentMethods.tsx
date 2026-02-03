
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, QrCode, Smartphone, HelpCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type PaymentMethodStats = {
    method: string;
    count: number;
    percentage: number;
    icon: any;
    color: string;
    bgColor: string;
};

export const AdminPaymentMethods = () => {
    const [stats, setStats] = useState<PaymentMethodStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                console.log('🔍 [AdminPaymentMethods] Fetching data from formas_de_pagamento...');
                
                const { data, error } = await supabase
                    .from("formas_de_pagamento")
                    .select("*");

                console.log('📊 [AdminPaymentMethods] Response:', { data, error });

                if (error) {
                    console.error("❌ [AdminPaymentMethods] Error fetching payment methods:", error);
                    setLoading(false);
                    return;
                }

                const rows = data || [];
                const totalPayments = rows.length;
                
                console.log(`✅ [AdminPaymentMethods] Found ${totalPayments} payment(s)`, rows);
                
                setTotal(totalPayments);

                // Count by payment method
                const methodCounts: Record<string, number> = {};
                rows.forEach((row: any) => {
                    const method = (row.forma || row.metodo_pagamento || row.metodo || "Outros").toString().toLowerCase();
                    console.log(`💳 [AdminPaymentMethods] Processing payment:`, { row, method });
                    methodCounts[method] = (methodCounts[method] || 0) + 1;
                });

                console.log('📈 [AdminPaymentMethods] Method counts:', methodCounts);

                // Define payment methods with icons and colors
                const methodConfig: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
                    "pix": { icon: QrCode, color: "#22c55e", bgColor: "#dcfce7", label: "PIX" },
                    "cartao": { icon: CreditCard, color: "#3b82f6", bgColor: "#dbeafe", label: "Cartão" },
                    "cartão": { icon: CreditCard, color: "#3b82f6", bgColor: "#dbeafe", label: "Cartão" },
                    "boleto": { icon: QrCode, color: "#f59e0b", bgColor: "#fef3c7", label: "Boleto" },
                    "apple pay": { icon: Smartphone, color: "#000000", bgColor: "#f3f4f6", label: "Apple Pay" },
                    "applepay": { icon: Smartphone, color: "#000000", bgColor: "#f3f4f6", label: "Apple Pay" },
                };

                // Always show main payment methods
                const mainMethods = ["PIX", "Cartão", "Boleto", "Apple Pay"];
                const statsArray: PaymentMethodStats[] = mainMethods.map((label) => {
                    // Find count for this method (checking various possible keys)
                    let count = 0;
                    const labelLower = label.toLowerCase();
                    
                    Object.keys(methodCounts).forEach((key) => {
                        if (key === labelLower || 
                            (labelLower === "cartão" && key === "cartao") ||
                            (labelLower === "apple pay" && (key === "applepay" || key === "apple pay"))) {
                            count += methodCounts[key];
                        }
                    });

                    const config = methodConfig[labelLower] || methodConfig[label.toLowerCase().replace("ã", "a")] || {
                        icon: HelpCircle,
                        color: "#64748b",
                        bgColor: "#f1f5f9",
                        label: label
                    };

                    return {
                        method: label,
                        count,
                        percentage: totalPayments > 0 ? Math.round((count / totalPayments) * 100) : 0,
                        icon: config.icon,
                        color: config.color,
                        bgColor: config.bgColor,
                    };
                });

                console.log('🎯 [AdminPaymentMethods] Final stats:', statsArray);

                setStats(statsArray);
                setLoading(false);
            } catch (e) {
                console.error("💥 [AdminPaymentMethods] Exception:", e);
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Formas de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Formas de Pagamento</CardTitle>
                <p className="text-sm text-muted-foreground">Total de {total} pagamento{total !== 1 ? 's' : ''} registrado{total !== 1 ? 's' : ''}</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        const hasData = stat.count > 0;
                        return (
                            <Card 
                                key={stat.method} 
                                className="bg-card/40 backdrop-blur-sm border-border/50 hover:border-opacity-80 transition-all hover-lift"
                            >
                                <CardContent className="p-3">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div 
                                            className="p-1.5 rounded transition-colors" 
                                            style={{ backgroundColor: stat.bgColor }}
                                        >
                                            <Icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                                        </div>
                                        <span className="text-xs font-semibold">{stat.method}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold">{stat.percentage}%</span>
                                            {hasData && <span className="text-xs text-green-400">+{stat.percentage}%</span>}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">{stat.count}/{total}</div>
                                        {/* Mini trend bar */}
                                        <div className="h-6 -mx-3 -mb-3 mt-2">
                                            <div className="w-full h-full relative">
                                                <div 
                                                    className="absolute bottom-0 left-0 right-0 h-1 rounded-t"
                                                    style={{ 
                                                        backgroundColor: stat.color,
                                                        opacity: 0.15,
                                                        width: '100%'
                                                    }}
                                                />
                                                {hasData && (
                                                    <div 
                                                        className="absolute bottom-0 left-0 h-1 rounded-t transition-all"
                                                        style={{ 
                                                            backgroundColor: stat.color,
                                                            opacity: 0.6,
                                                            width: `${stat.percentage}%`
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
