
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageCircle, Download } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";

export const AdminAbandonedCart = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAbandoned = async () => {
            setLoading(true);
            try {
                // Fetch all potential leads
                const { data, error } = await supabase
                    .from("clientes_meu_auxiliar")
                    .select("id, email, session_id, created_at, vip, teste, nome_lead");

                if (error) throw error;

                const now = new Date();
                
                // Filter logic: Not VIP AND Created >= 3 days ago (Expired Trial)
                 const abandoned = (data || []).map((u: any) => {
                     const created = new Date(u.created_at);
                     const diffTime = Math.abs(now.getTime() - created.getTime());
                     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                     return { ...u, diffDays };
                 }).filter((u: any) => {
                    const vipStatus = (u.vip || u.VIP || '').toString().toLowerCase();
                    const isVip = vipStatus === 'sim' || vipStatus === 'true';
                    
                    // We specifically want people whose 3-day trial has passed OR IS ENDING today.
                    // So diffDays should be >= 3. 
                    return !isVip && u.diffDays >= 3; 
                }).sort((a: any, b: any) => b.created_at.localeCompare(a.created_at)); // Newest leads first

                setUsers(abandoned);
            } catch (e) {
                console.error("Error fetching recovery list", e);
                toast.error("Erro ao carregar lista de recuperação");
            } finally {
                setLoading(false);
            }
        };

        fetchAbandoned();
    }, []);

    const handleWhatsApp = (session_id: string | null | undefined, name: string) => {
        if (!session_id) {
            toast.error("Usuário sem telefone cadastrado");
            return;
        }
        const target = session_id.replace(/\D/g, "");
        const displayName = name || "Cliente";
        const message = encodeURIComponent(`Olá ${displayName}, tudo bem? Vi que seu período de teste do Meu Auxiliar encerrou. \n\nConseguiu aproveitar as funcionalidades? Temos uma condição especial para você continuar organizando suas finanças! 🚀`);
        window.open(`https://wa.me/${target}?text=${message}`, "_blank");
    };

    const exportCsv = () => {
        const header = "Nome,Email,Telefone,Data Cadastro,Dias Expirado\n";
        const rows = users.map(u => 
            `${u.nome_lead || u.nome || "Sem nome"},${u.email || "-"},${u.session_id || "-"},${new Date(u.created_at).toLocaleDateString()},${u.diffDays}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + header + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "recuperacao_vendas.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent">Recuperação de Vendas</h2>
                        <p className="text-muted-foreground">Usuários com trial expirado (3+ dias) que ainda não assinaram.</p>
                    </div>
                    <Button onClick={exportCsv} variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                    </Button>
                </div>

                <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Oportunidades de Venda ({users.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
                        ) : users.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">Nenhuma oportunidade encontrada. Todos converteram ou estão em dia!</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Telefone</TableHead>
                                        <TableHead>Cadastro</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{(user as any).nome_lead || (user as any).nome || "Sem nome"}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.session_id || "-"}</TableCell>
                                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                                    Expirado há {user.diffDays - 3} dias
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={() => handleWhatsApp(user.session_id, user.nome_lead || user.nome)}>
                                                    <MessageCircle className="h-4 w-4" />
                                                    Recuperar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};
