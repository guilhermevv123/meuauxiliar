import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Shield } from "lucide-react";


const PricingSection = () => {
  // Preços
  const annualPrice = 147.90; // Valor à vista
  const annualInstallmentValue = 15.15; // Valor de cada parcela (12x com taxas)
  const annualMonthlyEquivalent = annualInstallmentValue.toFixed(2);
  const monthlyPrice = 19.90; // Para cálculo de economia

  const features = [
    "WhatsApp integrado ilimitado",
    "Dashboard completo em tempo real",
    "Categorias personalizadas",
    "Agenda inteligente com lembretes",
    "Gestão de dívidas e pagamentos",
    "Relatórios e exportação Excel",
    "Backup automático na nuvem",
    "Suporte prioritário 24/7",
    "Atualizações gratuitas",
  ];

  const handleSubscribe = () => {
    // Redirecionar para o link de pagamento anual do Kirvano
    window.location.href = 'https://pay.kirvano.com/5c67223b-590f-4639-95fd-a71bbc9b5e59';
  };

  return (
    <section id="precos" className="container mx-auto px-4 py-20 pt-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha seu plano
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Comece a transformar sua vida financeira hoje mesmo
          </p>
        </div>


        {/* Pricing Card - Plano Anual Único */}
        <div className="max-w-lg mx-auto">
          <div className="relative bg-card rounded-3xl border-2 border-primary shadow-glow overflow-hidden">
            {/* Badge Recomendado */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-gradient-purple text-primary-foreground px-6 py-2 rounded-full font-bold text-sm shadow-glow flex items-center gap-2">
                <Crown className="h-4 w-4" />
                MELHOR OFERTA
              </div>
            </div>

            {/* Header do Plano */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 pt-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-bold">Plano Anual</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-6xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                    R$ {annualMonthlyEquivalent.replace('.', ',')}
                  </span>
                  <span className="text-xl text-muted-foreground">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  R$ {annualPrice.toFixed(2).replace('.', ',')} cobrado anualmente
                </p>
                <div className="inline-flex items-center gap-2 mt-3 bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-sm font-semibold">
                  <Zap className="h-4 w-4" />
                  Economize R$ {((monthlyPrice * 12) - annualPrice).toFixed(2).replace('.', ',')} por ano
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleSubscribe}
                className="w-full text-lg py-7 rounded-xl transition-transform hover:scale-105 bg-gradient-purple shadow-glow"
              >
                Assinar Agora
              </Button>
            </div>

            {/* Recursos Inclusos */}
            <div className="p-8">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                O que está incluso:
              </h4>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 group-hover:bg-primary/20 transition-colors">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-foreground/80 group-hover:text-foreground transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Garantia */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5 text-primary" />
            <span>Garantia de 7 dias • Cancele quando quiser • Sem taxas ocultas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
