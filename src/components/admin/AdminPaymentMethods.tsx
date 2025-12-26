
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, QrCode, Barcode, HelpCircle } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const TinyChart = ({ color }: { color: string }) => {
    const data = [{v: 10}, {v: 15}, {v: 8}, {v: 12}, {v: 20}, {v: 18}, {v: 25}];
    return (
        <div className="h-8 w-16">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const AdminPaymentMethods = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col justify-between h-full hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                         <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 rounded-md group-hover:bg-blue-200 transition-colors">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Cartão</span>
                         </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">0%</div>
                            <div className="text-[10px] text-slate-400">0/0</div>
                        </div>
                        <TinyChart color="#3b82f6" />
                    </div>
                </CardContent>
            </Card>

             <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col justify-between h-full hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                         <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-100 rounded-md group-hover:bg-green-200 transition-colors">
                                <QrCode className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">PIX</span>
                         </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">100%</div>
                            <div className="text-[10px] text-slate-400">1/1</div>
                        </div>
                         <TinyChart color="#22c55e" />
                    </div>
                </CardContent>
            </Card>

             <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col justify-between h-full hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex items-start justify-between">
                         <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-amber-100 rounded-md group-hover:bg-amber-200 transition-colors">
                                <Barcode className="h-4 w-4 text-amber-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">Boleto</span>
                         </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">0%</div>
                            <div className="text-[10px] text-slate-400">0/0</div>
                        </div>
                        <TinyChart color="#f59e0b" />
                    </div>
                </CardContent>
            </Card>

             <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between">
                         <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-slate-500" />
                            <span className="text-xs font-bold text-slate-700">Outros</span>
                         </div>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <div className="text-2xl font-bold text-slate-900">0%</div>
                            <div className="text-[10px] text-slate-400">0/0</div>
                        </div>
                        <TinyChart color="#64748b" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
