
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ChartBar, Wallet, PercentCircle, LogOut, Menu, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAdminSession, getAdminSession } from "@/lib/adminSession";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoFull from "@/assets/logo-full.png";

const NavItem = ({ to, icon: Icon, label, onClick }: { to: string; icon: any; label: string; onClick?: () => void }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active ? "bg-primary/20 text-primary font-semibold shadow-luxury border border-primary/10" : "hover:bg-primary/5 hover:text-primary hover:translate-x-1"}`}
    >
      <Icon className={`h-5 w-5 ${active ? "animate-pulse" : ""}`} />
      <span>{label}</span>
    </Link>
  );
};

const SidebarContent = ({ onClose }: { onClose?: () => void }) => {
  const session = getAdminSession();
  return (
    <div className="flex flex-col h-full">
         <div className="p-6 pb-8">
          <img src={logoFull} alt="Meu Auxiliar" className="h-10 w-auto mb-2" />
          <p className="text-xs text-muted-foreground/80 font-medium px-1">Painel Administrativo</p>
          <p className="text-[10px] text-muted-foreground/50 px-1 truncate">{session?.email}</p>
        </div>
        <nav className="space-y-2 px-4 flex-1">
          <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
          <NavItem to="/admin/crm" icon={Users} label="Clientes" onClick={onClose} />
          <NavItem to="/admin/vendas" icon={ChartBar} label="Vendas" onClick={onClose} />
          <NavItem to="/admin/conversao" icon={PercentCircle} label="Conversão" onClick={onClose} />
          <NavItem to="/admin/abandoned" icon={ShoppingCart} label="Carrinho Abandonado" onClick={onClose} />
          <NavItem to="/admin/automations" icon={Zap} label="Automações" onClick={onClose} />
        </nav>
        <div className="p-4 mt-auto">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { clearAdminSession(); location.href = "/admin"; }}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
    </div>
  )
}

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[280px] border-r border-border/40 bg-card/30 backdrop-blur-xl fixed inset-y-0 z-50">
       <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-[280px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/50 backdrop-blur-md px-6 py-4 flex items-center justify-between md:justify-end">
           <div className="md:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="h-6 w-6" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-r border-border/40 bg-background/95 backdrop-blur-xl">
                 <SidebarContent onClose={() => setIsMobileOpen(false)} />
              </SheetContent>
            </Sheet>
           </div>
           {/* Header Content can go here if needed, currently empty on desktop to keep it clean */}
        </header>
        <section className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </section>
      </main>
    </div>
  );
};

export default AdminLayout;
