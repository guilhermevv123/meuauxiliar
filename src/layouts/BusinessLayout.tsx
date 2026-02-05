import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  Wallet, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Building2,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import logoFull from "@/assets/logo-full.png";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/empresas/dashboard" },
  { icon: BarChart3, label: "Fluxo de Caixa", href: "/empresas/fluxo" },
  { icon: Wallet, label: "Contas a Pagar", href: "/empresas/pagar" },
  { icon: Wallet, label: "Contas a Receber", href: "/empresas/receber" },
  { icon: Users, label: "Clientes", href: "/empresas/clientes" },
  { icon: FileText, label: "Relatórios", href: "/empresas/relatorios" },
  { icon: Settings, label: "Configurações", href: "/empresas/configuracoes" },
];

export function BusinessLayout() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 border-b border-slate-800">
        <Link to="/empresas/dashboard" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-xl tracking-tight">Meu Auxiliar <span className="text-blue-400 text-sm block font-normal">Empresas</span></span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-3 space-y-1">
        {sidebarItems.map((item) => (
          <Link 
            key={item.href} 
            to={item.href}
            onClick={() => setIsMobileOpen(false)}
          >
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 text-base h-12 ${
                location.pathname === item.href 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "hover:bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <Link to="/empresas">
            <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:bg-slate-800 hover:text-red-300">
            <LogOut className="h-5 w-5" />
            Sair do Modo Empresa
            </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 fixed h-screen z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 lg:ml-72 min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <h1 className="font-semibold text-lg text-slate-700">
              {sidebarItems.find(i => i.href === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                EM
             </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
