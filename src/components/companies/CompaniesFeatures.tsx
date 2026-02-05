import { 
  Building2, 
  Files, 
  BarChart3, 
  Users, 
  Wallet, 
  FileText 
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Centros de Custos e Lucros",
    description: "Controle exatamente de onde vem e para onde vai o dinheiro da sua empresa com centros de custos personalizados."
  },
  {
    icon: Files,
    title: "Emissão de Boletos",
    description: "Emita boletos registrados para seus clientes diretamente pelo sistema com conciliação automática."
  },
  {
    icon: BarChart3,
    title: "Demonstrativo (DRE)",
    description: "Acompanhe a saúde financeira da sua empresa com DRE gerencial completo e em tempo real."
  },
  {
    icon: Users,
    title: "Múltiplos Usuários",
    description: "Compartilhe o acesso com seus sócios ou equipe financeira definindo permissões específicas."
  },
  {
    icon: Wallet,
    title: "Controle de Caixa",
    description: "Faça a gestão completa do fluxo de caixa, contas a pagar e receber com previsões futuras."
  },
  {
    icon: FileText,
    title: "Gestão de Projetos",
    description: "Vincule receitas e despesas a projetos específicos para analisar a rentabilidade individual."
  }
];

export function CompaniesFeatures() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
            Recursos Poderosos para seu Negócio
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tudo o que você precisa para profissionalizar a gestão financeira da sua empresa em uma única plataforma.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
