import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ChartBar, Wallet, PercentCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAdminSession, getAdminSession } from "@/lib/adminSession";

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${active ? "bg-primary/10 text-primary" : "hover:bg-muted/30"}`}>
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const session = getAdminSession();
  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
      <aside className="bg-background border-r border-border/40 p-4 space-y-6">
        <div className="px-2">
          <h2 className="text-xl font-bold">CRM Admin</h2>
          <p className="text-xs text-muted-foreground">{session?.email}</p>
        </div>
        <nav className="space-y-1">
          <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/admin/crm" icon={Users} label="Clientes" />
          <NavItem to="/admin/faturamento" icon={Wallet} label="Faturamento" />
          <NavItem to="/admin/vendas" icon={ChartBar} label="Vendas" />
          <NavItem to="/admin/conversao" icon={PercentCircle} label="Conversão" />
        </nav>
        <div className="pt-4">
          <Button variant="outline" className="w-full" onClick={() => { clearAdminSession(); location.href = "/admin"; }}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="bg-muted/20">
        <header className="border-b border-border/40 px-6 py-4">
          <h1 className="text-xl font-bold">Painel Administrativo</h1>
        </header>
        <section className="p-6">{children}</section>
      </main>
    </div>
  );
};

export default AdminLayout;

