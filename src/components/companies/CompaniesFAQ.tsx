import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "O sistema serve para qualquer tipo de empresa?",
    answer: "Sim! O Meu Auxiliar Empresas foi desenhado para atender prestadores de serviços, comércio varejista, profissionais liberais e pequenas indústrias."
  },
  {
    question: "Posso acessar de qualquer lugar?",
    answer: "Com certeza. Somos uma plataforma 100% em nuvem e otimizada para dispositivos móveis. Você acessa seus dados pelo computador, tablet ou celular."
  },
  {
    question: "A emissão de boletos tem custo adicional?",
    answer: "Não cobramos taxa de adesão para emissão de boletos. Você paga apenas uma pequena taxa por boleto *compensado*, ou seja, só quando seu cliente paga."
  },
  {
    question: "Como funciona o suporte?",
    answer: "Nosso suporte é humanizado e funciona em horário comercial via chat e email. Planos Pro e Empresarial contam também com suporte via WhatsApp."
  },
  {
    question: "Meus dados estão seguros?",
    answer: "Segurança é nossa prioridade. Utilizamos criptografia de ponta a ponta (SSL) e backups diários automáticos em servidores seguros."
  }
];

export function CompaniesFAQ() {
  return (
    <section className="py-20 bg-background">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-center mb-12">
          Perguntas Frequentes
        </h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
