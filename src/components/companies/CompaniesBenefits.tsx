import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const benefits = [
  "Suporte prioritário via WhatsApp",
  "Backup automático diário",
  "Importação de OFX e Excel",
  "API para integrações",
  "Sem limite de cadastros",
  "Acesso via App (iOS e Android)"
];

export function CompaniesBenefits() {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 translate-y-8">
                   <div className="bg-muted p-6 rounded-2xl h-40"></div>
                   <div className="bg-primary/5 p-6 rounded-2xl h-56 border-2 border-primary/20"></div>
                </div>
                <div className="space-y-4">
                   <div className="bg-primary/10 p-6 rounded-2xl h-56 border-2 border-primary/20"></div>
                   <div className="bg-muted p-6 rounded-2xl h-40"></div>
                </div>
             </div>
          </div>
          
          <div className="order-1 lg:order-2 flex flex-col gap-6">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Por que escolher o Meu Auxiliar Empresas?
            </h2>
            <p className="text-lg text-muted-foreground">
              Desenvolvido pensando na realidade das PMEs brasileiras, focamos em agilidade, segurança e facilidade de uso para que você perca menos tempo com planilhas e foque no crescimento.
            </p>
            
            <ul className="grid gap-4 mt-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Button size="lg" className="h-12 px-8">
                Começar Agora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
