import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "MEI / Autônomo",
    price: "R$ 29,90",
    description: "Ideal para quem está começando e precisa de organização simples.",
    features: [
      "Controle de Entradas e Saídas",
      "Emissão de Recibos Simples",
      "1 Usuário",
      "Suporte por Email",
      "App Mobile"
    ]
  },
  {
    name: "Pequenas Empresas",
    price: "R$ 59,90",
    description: "Recursos avançados para empresas em crescimento.",
    popular: true,
    features: [
      "Tudo do plano MEI",
      "Emissão de Boletos (10/mês)",
      "Fluxo de Caixa Projetado",
      "3 Usuários",
      "Suporte via Chat",
      "Centros de Custo"
    ]
  },
  {
    name: "Empresarial Pro",
    price: "R$ 99,90",
    description: "Gestão completa e sem limites para seu negócio voar.",
    features: [
      "Tudo do plano Pequenas Empresas",
      "Boletos Ilimitados",
      "API de Integração",
      "10 Usuários",
      "Suporte Prioritário WhatsApp",
      "DRE Gerencial",
      "Gestão de Projetos"
    ]
  }
];

export function CompaniesPricing() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
            Planos que cabem no seu orçamento
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Sem taxas de implementação, sem fidelidade. Cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`relative bg-background rounded-2xl p-8 border hover:shadow-lg transition-all ${
                plan.popular ? 'border-primary shadow-md scale-105 z-10' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
                  Mais Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/mês</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full"
              >
                Começar Teste Grátis
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
