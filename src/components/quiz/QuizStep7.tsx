import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Shield, CheckCircle2, ChevronDown, Check, CreditCard, HelpCircle, Lock, Star } from "lucide-react";
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

export const QuizStep7 = () => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 10, seconds: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const plans = {
    lifetime: {
      url: "https://pay.kirvano.com/00f2290d-a222-48a9-ba73-7b5435603b0f",
      price: 57.00,
      oldPrice: 197.00,
      period: "único",
      label: "Vitalício",
      savings: "Economize R$ 140,00"
    }
  };

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

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto min-h-[80vh] px-4 py-8 bg-background text-foreground space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
            <div className="inline-block bg-primary/10 text-primary text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase border border-primary/20">
                Análise Verificada
            </div>
            <h1 className="text-3xl font-black leading-tight text-white">
                Seu desconto de <span className="text-primary italic">71% OFF</span> foi aplicado com sucesso.
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
                Você acaba de garantir o acesso vitalício pelo menor preço histórico.
            </p>
        </div>

        {/* Growth Graph */}
        <div className="w-full bg-card/50 p-6 rounded-3xl border border-border/50 relative overflow-hidden">
            <div className="flex justify-between items-end h-40 relative z-10 px-2 pb-6">
                {/* SVG Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{overflow: 'visible'}}>
                    <defs>
                        <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#d8b4fe" />
                        </linearGradient>
                    </defs>
                    <path 
                        d="M 20 120 C 60 115, 120 100, 180 70 C 240 40, 280 30, 320 20" 
                        fill="none" 
                        stroke="url(#line-gradient)" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                    />
                    {/* Points */}
                    <circle cx="20" cy="120" r="4" fill="#a855f7" />
                    <circle cx="320" cy="20" r="4" fill="#d8b4fe" />
                </svg>

                <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-primary">R$ 50</span>
                    <span className="text-[10px] text-muted-foreground">Você hoje</span>
                    <span className="text-[10px] text-muted-foreground mt-4">Jan</span>
                </div>
                
                <div className="flex flex-col items-center gap-1 absolute right-2 -top-2">
                     <span className="text-[10px] text-muted-foreground mb-1">Daqui 6 meses</span>
                    <span className="font-bold text-primary text-lg">R$ 7.492</span>
                </div>
            </div>
             <div className="flex justify-between px-2 text-[10px] text-muted-foreground opacity-50">
                <span>Fev</span>
                <span>Mar</span>
                <span>Abr</span>
                <span>Mai</span>
                <span>Jun</span>
            </div>
        </div>

        {/* Imagine Text */}
        <div className="bg-secondary/30 p-6 rounded-2xl text-center space-y-2 border border-border/50">
            <p className="text-sm leading-relaxed">
                Imagine você daqui a 6 meses, <strong className="text-green-400">com dinheiro sobrando</strong> para viajar ou para completar pra trocar de carro, <strong className="text-green-400">tudo por causa da decisão que você tomou hoje.</strong>
            </p>
        </div>



        {/* MEDIA REPERCUSSION - NEW SECTION */}
        <div className="w-full space-y-4">
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Saiu na Mídia</h3>
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 items-center">
                <div className="w-full bg-muted rounded-lg relative overflow-hidden group shadow-lg">
                    <img 
                        src="/materia.jpg" 
                        alt="Matéria sobre o MeuAuxiliar" 
                        className="w-full h-auto opacity-95 hover:scale-105 transition-transform duration-500"
                    />
                </div>
                
                <div className="flex flex-col items-center text-center space-y-3 w-full">
                    <h4 className="font-bold text-base leading-tight text-foreground max-w-xs">
                        "A Inteligência Artificial que está ajudando brasileiros a saírem do vermelho em tempo recorde"
                    </h4>
                    
                     <div className="flex justify-center gap-3 opacity-60">
                         {/* Icons/Logos placeholder */}
                        <div className="h-4 w-12 bg-foreground/20 rounded"></div>
                        <div className="h-4 w-12 bg-foreground/20 rounded"></div>
                     </div>

                    <a 
                        href="https://www.instagram.com/p/DTYwlPRCh-6/?img_index=1" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
                    >
                        Ver matéria completa no Instagram 
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                </div>
            </div>
        </div>

        {/* RESULTS GALLERY - NEW SECTION */}
        <div className="w-full space-y-4">
             <div className="flex items-center gap-2 justify-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <h3 className="font-bold text-center">Resultados Reais</h3>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            
            <div className="flex overflow-x-auto gap-3 pb-4 snap-x px-2 -mx-4 scrollbar-hide">
                {['print1.PNG', 'print2.PNG', 'print3.PNG'].map((img, i) => (
                    <div key={i} className="min-w-[200px] bg-black rounded-xl overflow-hidden border border-border snap-center relative aspect-[9/16]">
                         <img 
                            src={`/${img}`}
                            alt={`Resultado ${i + 1}`}
                            className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-[10px] text-center text-white/80">
                            Resultado Verificado
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-center text-muted-foreground italic">
                Deslize para ver mais resultados
            </p>
        </div>



        {/* Authority / Not Cheap */}
        <div className="text-center space-y-6">
            <p className="text-xs text-muted-foreground">
                Todos os nossos recursos foram desenvolvidos em conjunto por programadores de ponta e os melhores analistas financeiros.
            </p>
            
            <p className="font-bold text-sm">
                Não é barato construir uma Inteligência Artificial do 0.
            </p>

            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 mx-auto text-primary"
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </motion.div>

             <p className="text-xs text-muted-foreground">
                Poderíamos te cobrar o valor de mercado, R$497 POR ANO, pelo dinheiro que vamos economizar pra você.
            </p>
            
             <p className="text-sm font-medium text-primary">
                Mas não faria sentido cobrarmos tanto sendo que o que queremos é a sua LIBERDADE FINANCEIRA. Queremos o melhor pra você e você pode ter certeza disso.
            </p>
        </div>

        {/* Timer Button */}
        <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-bold shadow-glow animate-pulse">
            <Clock className="w-5 h-5 mr-2" />
            Oferta Válida para Sempre por: {timeLeft.minutes}:{String(timeLeft.seconds).padStart(2, '0')}
        </Button>

        {/* Testimonial */}
        {/* Testimonials Carousel */}
        <div className="w-full bg-card border border-border rounded-xl p-4 shadow-luxury relative min-h-[140px] flex flex-col justify-between">
            <div className="flex items-start gap-3">
                 <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden shrink-0">
                    <img 
                        src={testimonials[currentTestimonial].image} 
                        alt={testimonials[currentTestimonial].name} 
                        className="w-full h-full object-cover"
                    />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-sm">{testimonials[currentTestimonial].name}</span>
                            <span className="text-xs text-muted-foreground">{testimonials[currentTestimonial].username}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{testimonials[currentTestimonial].time}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                        <span className="bg-green-500/10 text-green-500 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold border border-green-500/20">
                            <Check className="w-3 h-3" /> Compra Verificada
                        </span>
                        <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
                        </div>
                    </div>
                    <motion.p 
                        key={currentTestimonial}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-muted-foreground leading-relaxed"
                    >
                        {testimonials[currentTestimonial].text}
                    </motion.p>
                 </div>
            </div>
            <div className="flex justify-center gap-1 mt-4">
                {testimonials.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentTestimonial(idx)}
                        className={cn(
                            "w-1.5 h-1.5 rounded-full transition-colors",
                            currentTestimonial === idx ? "bg-primary" : "bg-border"
                        )}
                    />
                ))}
            </div>
        </div>

        {/* Benefits Recap */}
        <div className="w-full bg-card/30 border border-border/50 rounded-xl p-5 space-y-3">
             <h3 className="font-bold text-center text-sm mb-2">Tudo que você recebe hoje:</h3>
             <ul className="space-y-2">
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Acesso VITALÍCIO (Para Sempre) ao MeuAuxiliar</span>
                </li>
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
                    <span>Grupo VIP de Membros</span>
                </li>
             </ul>
        </div>

        {/* Pricing Selection */}
        <div className="w-full space-y-6">
            {/* Annual */}
             <div 
                onClick={() => {
                    const eventId = `addcart_${Date.now()}`;
                    if (window.fbq) window.fbq('track', 'AddToCart', { content_name: 'Acesso Vitalício' }, { eventID: eventId });
                    import('@/lib/meta-capi').then(({ sendCapiEvent }) => {
                        sendCapiEvent({
                            eventName: 'AddToCart',
                            eventId: eventId,
                            sourceUrl: window.location.href,
                            customData: { content_name: 'Acesso Vitalício' }
                        });
                    });
                    window.open(plans.lifetime.url, '_blank');
                }}
                className="w-full rounded-2xl p-0 relative cursor-pointer overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all"
            >
                {/* Header */}
                <div className="bg-[#8b5cf6] text-white text-xs font-black text-center py-3 tracking-wider uppercase">
                    Oferta para sempre - 71% OFF
                </div>
                
                {/* Body - Forced Dark */}
                <div className="p-6 bg-[#09090b] text-white flex flex-col gap-4 relative">
                    <div className="absolute top-4 right-6 text-xs text-gray-400 line-through">
                        De R$ 197,00
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-6 h-6 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center border border-[#8b5cf6]">
                            <Check className="w-3 h-3 text-[#8b5cf6]" />
                        </div>
                        <span className="font-bold text-gray-200">Acesso VITALÍCIO</span>
                    </div>

                    <div className="flex items-baseline gap-1 mt-[-4px] ml-9">
                        <span className="text-4xl font-black text-white">R$ 57,00</span>
                    </div>
                    
                    <div className="text-right mt-[-8px]">
                        <span className="text-[10px] text-gray-400">Pagamento Único</span>
                    </div>
                </div>
            </div>

             <div className="bg-gray-100 rounded-full py-1.5 px-4 text-[10px] text-center text-gray-500 mx-auto w-fit border border-gray-200">
                (Acesso liberado para sempre, sem mensalidades)
            </div>
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



        {/* Payment Methods */}
        <div className="flex flex-wrap justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
             <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo%E2%80%94pix_powered_by_Banco_Central_%28Brazil%2C_2020%29.svg" alt="Pix" className="h-4" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-4" />
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
                    <AccordionTrigger>Funciona em iPhone e Android?</AccordionTrigger>
                    <AccordionContent>
                    Sim! O MeuAuxiliar funciona direto no seu WhatsApp, não precisa baixar nenhum aplicativo pesado. Roda em qualquer celular.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger>E se eu não gostar?</AccordionTrigger>
                    <AccordionContent>
                    Você tem 30 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro. Sem letras miúdas.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 grayscale opacity-70">
            <div className="flex items-center gap-1 font-bold text-sm">
                <Shield className="w-4 h-4" /> ABSTARTUPS
            </div>
            <div className="flex items-center gap-1 font-bold text-sm">
                Meta
            </div>
        </div>

        <div className="text-center space-y-4 w-full">
            <p className="text-xs text-muted-foreground">
                Somos associados com a Meta e ABStartups para entregar o melhor produto
            </p>
            <Button 
                className="w-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-glow"
                onClick={() => window.open(plans.lifetime.url, '_blank')}
            >
                Quero meu acesso para sempre
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
