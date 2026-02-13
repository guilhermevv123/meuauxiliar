import { motion } from 'framer-motion';
import { MessageSquare, BarChart3, BellRing, CalendarClock, ShieldAlert, Target, PercentCircle } from 'lucide-react';

const features = [
    {
        icon: MessageSquare,
        title: "1. Registro de Gastos",
        desc: "Diga adeus às planilhas chatas. Apenas envie um áudio ou texto como se falasse com um amigo."
    },
    {
        icon: BarChart3,
        title: "2. Consulta Financeira",
        desc: "Pergunte o que quiser: 'Quanto gastei com Uber?', 'Posso gastar hoje?', tudo na hora."
    },
    {
        icon: BellRing,
        title: "3. Lembretes de Contas",
        desc: "Nunca mais pague juros por atraso. Nós te lembramos de tudo no dia certo."
    },
    {
        icon: CalendarClock,
        title: "4. Antecedência",
        desc: "Avisos inteligentes antes do seu cartão vencer para você se preparar."
    },
    {
        icon: ShieldAlert,
        title: "5. Limites de Gastos",
        desc: "Defina um teto para 'Delivery' ou 'Lazer' e seja avisado quando estiver perto de estourar."
    },
    {
        icon: Target,
        title: "6. Planejamento de Metas",
        desc: "Quer viajar ou trocar de carro? Criamos o plano perfeito para você realizar seus sonhos."
    },
    {
        icon: PercentCircle,
        title: "7. Alerta de Promoções",
        desc: "Monitoramos o preço das coisas que você quer comprar e te avisamos quando baixar."
    }
];

export const Quiz3Features = () => {
    return (
        <div className="space-y-8 px-2">
            <h2 className="text-3xl font-black text-center text-slate-900">
                Tudo o que você precisa em <span className="text-violet-600">um só lugar</span>
            </h2>
            
            <div className="grid grid-cols-1 gap-6">
                {features.map((feature, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                    >
                        <div className="w-12 h-12 shrink-0 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                            <feature.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 mb-1">{feature.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
