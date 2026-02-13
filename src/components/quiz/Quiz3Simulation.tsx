import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, BarChart3, PieChart, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
    id: string;
    type: 'user' | 'ai';
    content?: string;
    chart?: 'bar' | 'pie';
};

export const Quiz3Simulation = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', type: 'ai', content: 'Olá! Sou seu assistente financeiro. O que deseja fazer?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [step, setStep] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleInteraction = (action: string) => {
        if (isTyping) return;

        // User Message
        const userMsg: Message = { id: `u-${Date.now()}`, type: 'user', content: action };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);
        setStep(prev => prev + 1);

        // AI Response Logic
        setTimeout(() => {
            setIsTyping(false);
            let aiMsg: Message | null = null;

            if (step === 0) { // Expense
                aiMsg = { id: `a-${Date.now()}`, type: 'ai', content: '✅ Gasto adicionado: Calça (Roupas) - R$ 110,00' };
            } else if (step === 1) { // 7 Days
                aiMsg = { id: `a-${Date.now()}`, type: 'ai', chart: 'bar' };
            } else if (step === 2) { // Breakdown
                aiMsg = { id: `a-${Date.now()}`, type: 'ai', chart: 'pie' };
            } else {
                 aiMsg = { id: `a-${Date.now()}`, type: 'ai', content: '⚠️ Gasto acima do normal nesta semana (+R$ 157,00).' };
            }

            if (aiMsg) setMessages(prev => [...prev, aiMsg]);
        }, 1500);
    };

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-[2.5rem] overflow-hidden border-8 border-slate-900 shadow-2xl relative h-[600px] flex flex-col">
            {/* Mock Phone Status Bar */}
            <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center text-xs font-medium z-10">
                <span>9:41</span>
                <div className="flex gap-1.5">
                    <div className="w-4 h-2.5 bg-white rounded-[2px]" />
                    <div className="w-0.5 h-2.5 bg-white/30 rounded-[1px]" />
                </div>
            </div>

            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white p-4 flex items-center gap-3 shadow-md z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                    MA
                </div>
                <div>
                    <h3 className="font-bold text-sm leading-none">MeuAuxiliar</h3>
                    <p className="text-[10px] text-white/80">Online agora</p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-[#E5DDD5] relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }} />
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10" ref={scrollRef}>
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className={cn(
                                    "max-w-[85%] rounded-lg p-3 text-sm shadow-sm relative",
                                    msg.type === 'user' 
                                        ? "bg-[#DCF8C6] ml-auto text-slate-800 rounded-tr-none" 
                                        : "bg-white mr-auto text-slate-800 rounded-tl-none"
                                )}
                            >
                                {msg.content && <p>{msg.content}</p>}
                                
                                {msg.chart === 'bar' && (
                                    <div className="space-y-2 pt-1">
                                        <p className="font-bold text-xs text-slate-500 mb-2">Gastos - Últimos 7 dias</p>
                                        <div className="flex items-end gap-1 h-24 justify-between px-2">
                                            {[30, 60, 45, 80, 20, 90, 50].map((h, i) => (
                                                <div key={i} className="w-2 bg-violet-500 rounded-t" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {msg.chart === 'pie' && (
                                    <div className="space-y-2 pt-1">
                                        <p className="font-bold text-xs text-slate-500 mb-2">Divisão por Categoria</p>
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-16 h-16 rounded-full border-4 border-violet-500 flex items-center justify-center">
                                                <div className="absolute inset-0 border-4 border-emerald-400 rounded-full border-l-transparent border-b-transparent rotate-45" />
                                            </div>
                                            <ul className="text-[10px] space-y-1 text-slate-600">
                                                <li className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-500" /> Essencial</li>
                                                <li className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Lazer</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <span className="text-[9px] text-slate-400 block text-right mt-1">
                                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {isTyping && (
                         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white mr-auto rounded-lg rounded-tl-none p-3 shadow-sm w-16">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                            </div>
                         </motion.div>
                    )}
                </div>

                {/* Simulated Input Area */}
                <div className="bg-[#F0F0F0] p-2 flex items-center gap-2 relative z-20">
                    <div className="flex-1 overflow-x-auto flex gap-2 pb-1 scrollbar-hide">
                         {step === 0 && (
                            <button 
                                onClick={() => handleInteraction('Calça 110')}
                                className="whitespace-nowrap bg-white border border-slate-300 rounded-full px-4 py-2 text-sm text-violet-600 font-medium hover:bg-slate-50"
                            >
                                🛍️ Calça 110
                            </button>
                         )}
                         {step === 1 && (
                            <button 
                                onClick={() => handleInteraction('Quanto gastei nos últimos 7 dias?')}
                                className="whitespace-nowrap bg-white border border-slate-300 rounded-full px-4 py-2 text-sm text-violet-600 font-medium hover:bg-slate-50"
                            >
                                📊 Gastos 7 dias
                            </button>
                         )}
                         {step === 2 && (
                            <button 
                                onClick={() => handleInteraction('Divisão de gastos')}
                                className="whitespace-nowrap bg-white border border-slate-300 rounded-full px-4 py-2 text-sm text-violet-600 font-medium hover:bg-slate-50"
                            >
                                🍰 Divisão de Gastos
                            </button>
                         )}
                         {step > 2 && (
                            <div className="w-full text-center text-xs text-slate-400 py-2">
                                Demonstração Finalizada
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};
