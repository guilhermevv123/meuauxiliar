import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface QuizStep1Props {
    onNext: () => void;
}

export const QuizStep1 = ({ onNext }: QuizStep1Props) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 max-w-lg mx-auto space-y-8">
            
            {/* Header Text */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
            >
                <p className="text-xs text-slate-500 italic">
                    A mesma tecnologia usada por<br/>gerentes de investimentos.
                </p>

                <h1 className="text-3xl font-bold leading-tight text-slate-900">
                    Economize <span className="text-violet-600 font-black">+ de 400 Reais Em 30 Dias</span> sem cortar Os "Luxos" E Apenas Com O <span className="text-violet-600 font-black decoration-violet-600/30">Whatsapp."</span>
                </h1>

                <p className="text-slate-600 font-medium">
                    Não é aplicativo, nem planilha, nem Notion.<br/>
                    <strong className="text-violet-600">É inteligência artificial de ponta.</strong>
                </p>
            </motion.div>

            {/* 2x2 Grid */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
            >
                {/* Card 1 */}
                <div className="bg-violet-50 border border-violet-100 p-5 rounded-2xl text-center space-y-3">
                    <h3 className="font-bold text-sm text-slate-900">Pra onde tá indo seu dinheiro?</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Você trabalha o mês inteiro, mas não <strong className="text-violet-700">faz ideia de onde foi parar</strong> seu dinheiro suado.
                    </p>
                </div>

                {/* Card 2 */}
                <div className="bg-violet-50 border border-violet-100 p-5 rounded-2xl text-center space-y-3">
                    <h3 className="font-bold text-sm text-slate-900">Sem planilhas ou apps</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Tudo isso é complicado, dá muita preguiça de usar. <strong className="text-violet-700">Aqui você resolve direto no whatsapp.</strong>
                    </p>
                </div>

                {/* Card 3 */}
                <div className="bg-violet-50 border border-violet-100 p-5 rounded-2xl text-center space-y-3">
                    <h3 className="font-bold text-sm text-slate-900">Perdido nas dividas?</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Não sabe quanto paga de parcela, quanto tempo falta, quem deve, e <strong className="text-violet-700">não tem um plano para pagar.</strong>
                    </p>
                </div>

                {/* Card 4 */}
                <div className="bg-violet-50 border border-violet-100 p-5 rounded-2xl text-center space-y-3">
                    <h3 className="font-bold text-sm text-slate-900">Você paga mais caro sempre!</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Faz compras por impulso ou não pesquisa antes? <strong className="text-violet-700">Você está gastando mais e deixando de poupar.</strong>
                    </p>
                </div>
            </motion.div>

            {/* Button */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full pt-4"
            >
                <Button 
                    onClick={onNext}
                    className="w-full h-16 text-lg font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-2xl shadow-lg shadow-violet-600/30"
                >
                    Continuar
                </Button>
            </motion.div>

        </div>
    );
};
