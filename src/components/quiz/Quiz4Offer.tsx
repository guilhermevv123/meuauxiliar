import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Shield, CheckCircle2, Check, HelpCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const testimonials = [
  {
    name: "Ricardo",
    username: "@rick_invest",
    text: "Realmente consegui organizar meus investimentos e economizar para minha viagem dos sonhos!",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    likes: 3,
    time: "2 min atrás"
  },
  {
    name: "Ana Clara",
    username: "@ana_c",
    text: "Amei a facilidade de uso. Finalmente entendo para onde meu dinheiro vai. O suporte é nota 10!",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024e",
    likes: 12,
    time: "15 min atrás"
  },
  {
    name: "Pedro Alves",
    username: "@pedro_dev",
    text: "Interface incrível e muito rápida. Consegui cancelar assinaturas que nem usava mais.",
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024f",
    likes: 8,
    time: "1 h atrás"
  }
];

export const Quiz4Offer = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 10, seconds: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // checkout URLs provided by user
  const plans = {
    annual: {
      url: "https://pay.kirvano.com/5c67223b-590f-4639-95fd-a71bbc9b5e59",
      price: 147.90,
      monthlyPrice: 15.15,
      oldPrice: 497.00,
      label: "ANUAL",
      savings: "Mais Popular",
    },
    monthly: {
      url: "https://pay.kirvano.com/d6ed4c6a-cdaa-4cf0-8e7f-b096dddd7cda",
      price: 19.90,
      label: "MENSAL",
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 10, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckout = (url: string, planName: string) => {
    const eventId = `addcart_${Date.now()}`;
    // @ts-expect-error window.fbq is not typed
    if (window.fbq) window.fbq('track', 'AddToCart', { content_name: planName }, { eventID: eventId });
    
    import('@/lib/meta-capi').then(({ sendCapiEvent }) => {
        sendCapiEvent({
            eventName: 'AddToCart',
            eventId: eventId,
            sourceUrl: window.location.href,
            customData: { content_name: planName }
        });
    });

    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] px-4 py-8 bg-background text-foreground space-y-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
            <div className="inline-block bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase border border-primary/20">
                Plano Aprovado
            </div>
            <h1 className="text-3xl font-black leading-tight text-white">
                Escolha o plano ideal para sua <span className="text-primary italic">Liberdade Financeira</span>
            </h1>
        </div>

        {/* PRICING CARDS */}
        <div className="w-full space-y-6">
            
            {/* OPTION 1: ANNUAL (BEST VALUE) */}
             <div 
                onClick={() => handleCheckout(plans.annual.url, 'Plano Anual')}
                className="w-full rounded-2xl p-0 relative cursor-pointer overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all border-2 border-[#8b5cf6]"
            >
                {/* Header */}
                <div className="bg-[#8b5cf6] text-white text-xs font-black text-center py-2 tracking-wider uppercase flex justify-between px-6 items-center">
                    <span>Recomendado</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">ECONOMIZE R$ 90,00</span>
                </div>
                
                {/* Body - Dark */}
                <div className="p-6 bg-[#09090b] text-white flex flex-col gap-4 relative">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                             <div className="w-5 h-5 rounded-full bg-[#8b5cf6] flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="font-bold text-lg">Plano ANUAL</span>
                        </div>
                        <span className="text-xs text-gray-400 line-through">De R$ 497,00</span>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-sm text-gray-300">12x de apenas</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">R$ 15,15</span>
                        </div>
                         <span className="text-[10px] text-gray-400">ou R$ 147,90 à vista</span>
                    </div>
                </div>
            </div>

            {/* OPTION 2: MONTHLY */}
             <div 
                onClick={() => handleCheckout(plans.monthly.url, 'Plano Mensal')}
                className="w-full rounded-2xl p-0 relative cursor-pointer overflow-hidden shadow-lg transform hover:scale-[1.02] transition-all bg-white text-slate-900 border border-slate-200"
            >
                <div className="p-6 flex justify-between items-center">
                    <div>
                         <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-slate-300" />
                            </div>
                            <span className="font-bold text-lg">Plano Mensal</span>
                        </div>
                        <p className="text-xs text-slate-500 pl-7">Cancele quando quiser</p>
                    </div>
                    
                    <div className="text-right">
                         <div className="text-2xl font-black text-slate-900">R$ 19,90</div>
                         <span className="text-[10px] text-slate-500">/mês</span>
                    </div>
                </div>
            </div>

        </div>

        {/* Benefits Recap */}
        <div className="w-full bg-card/30 border border-border/50 rounded-xl p-5 space-y-3">
             <h3 className="font-bold text-center text-sm mb-2">Incluso em ambos os planos:</h3>
             <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Assistente Financeiro via WhatsApp 24h</span>
                </li>
                 <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Relatórios Semanais de Inteligência</span>
                </li>
                 <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Acesso Imediato</span>
                </li>
             </ul>
        </div>

        {/* Guarantee Badge */}
        <div className="w-full bg-white border border-[#8b5cf6]/30 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[#8b5cf6]/5 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-1">
                    <Shield className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">30 Dias de Garantia</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[260px]">
                    Riscos zero. Se você não amar, nós devolvemos 100% do seu dinheiro. Sem perguntas.
                </p>
            </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full space-y-4">
             <h3 className="font-bold text-center">Perguntas Frequentes</h3>
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>É seguro colocar meus dados?</AccordionTrigger>
                    <AccordionContent>
                    Sim! Utilizamos a Kirvano, uma das maiores plataformas de pagamento do Brasil. Seus dados são criptografados e não temos acesso aos números do seu cartão.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Como recebo o acesso?</AccordionTrigger>
                    <AccordionContent>
                    Imediatamente após a confirmação do pagamento, você receberá um e-mail e uma mensagem no WhatsApp com seu link de acesso exclusivo e senha.
                    </AccordionContent>
                </AccordionItem>
                 <AccordionItem value="item-3">
                    <AccordionTrigger>Posso cancelar o plano mensal?</AccordionTrigger>
                    <AccordionContent>
                    Sim! O plano mensal não tem fidelidade. Você pode cancelar a renovação a qualquer momento.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>

        <div className="text-center space-y-4 w-full">
            <p className="text-xs text-muted-foreground">
                Somos associados com a Meta e ABStartups para entregar o melhor produto
            </p>
            <Button 
                className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                onClick={() => handleCheckout(plans.annual.url, 'Plano Anual')}
            >
                Quero Organizar Minha Vida
            </Button>
        </div>
        
        {/* Support Link */}
        <a 
            href="https://wa.me/5573998538910?text=Tenho%20uma%20dúvida%20sobre%20o%20plano"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/60 hover:text-primary transition-colors flex items-center justify-center gap-1 pb-4"
        >
            <HelpCircle className="w-3 h-3" />
            Ainda com dúvidas? Fale conosco
        </a>
    </div>
  );
};
