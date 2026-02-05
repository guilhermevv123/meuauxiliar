import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CompaniesCTA() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter md:text-5xl mb-6">
          Pronto para organizar sua empresa?
        </h2>
        <p className="text-lg md:text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-10">
          Junte-se a milhares de empreendedores que transformaram sua gestão financeira com o Meu Auxiliar.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            variant="secondary" 
            className="h-14 px-8 text-lg font-semibold"
          >
            Começar Gratuitamente
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <p className="mt-6 text-sm text-primary-foreground/80">
          Não é necessário cartão de crédito para começar.
        </p>
      </div>
    </section>
  );
}
