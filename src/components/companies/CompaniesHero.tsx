import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CompaniesHero() {
  return (
    <section className="w-full py-20 lg:py-32 bg-background overflow-hidden relative">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 w-fit">
              Novo: Gestão Empresarial 2.0
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              Controle Financeiro Empresarial <br className="hidden lg:block" />
              <span className="text-primary">Simples e Poderoso</span>
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl max-w-[600px]">
              Gerencie fluxo de caixa, emita boletos, controle centros de custos e tenha visão total do seu negócio em um só lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-12 px-8 text-base">
                Experimente Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                Ver Planos
              </Button>
            </div>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>14 dias de teste grátis (sem cartão)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Suporte premium via WhatsApp</span>
              </div>
            </div>
          </div>
          
          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
            <div className="aspect-square lg:aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border p-4 shadow-2xl relative">
               {/* Placeholder for a dashboard screenshot simulation */}
               <div className="absolute inset-4 rounded-xl bg-background border shadow-sm flex flex-col overflow-hidden">
                  <div className="h-12 border-b bg-muted/30 flex items-center px-4 gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex justify-between items-center">
                       <div className="space-y-1">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-8 w-32 bg-primary/20 rounded"></div>
                       </div>
                       <div className="h-10 w-10 btn-primary rounded-full bg-primary"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-muted/20 rounded-lg border"></div>
                        <div className="h-24 bg-muted/20 rounded-lg border"></div>
                        <div className="h-24 bg-muted/20 rounded-lg border"></div>
                    </div>
                    <div className="flex-1 bg-muted/10 rounded-lg border mt-4"></div>
                  </div>
               </div>
               
               {/* Floating elements */}
               <div className="absolute -right-8 top-20 bg-background p-4 rounded-xl shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-1000 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      $
                    </div>
                    <div>
                      <p className="text-sm font-medium">Receita Mensal</p>
                      <p className="text-xl font-bold text-green-600">+ R$ 45.230,00</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
