import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Gift, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

const RewardClaimed = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-dark">
            <Navbar />

            <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-screen">
                <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
                    {/* Success Icon */}
                    <div className="mx-auto w-24 h-24 bg-gradient-purple rounded-full flex items-center justify-center shadow-glow animate-bounce">
                        <Check className="h-12 w-12 text-primary-foreground" />
                    </div>

                    {/* Title */}
                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-bold">
                            🎉 Desconto Resgatado!
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                            Parabéns! Você está a caminho de ganhar um <strong className="text-primary">desconto especial</strong> na sua assinatura.
                        </p>
                    </div>

                    {/* Instructions */}
                    <div className="bg-card border border-border/50 rounded-2xl p-8 space-y-6 text-left">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-primary font-bold">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Compartilhe com 5 amigos</h3>
                                <p className="text-sm text-muted-foreground">
                                    Envie a mensagem pelo WhatsApp para 5 amigos diferentes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-primary font-bold">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Aguarde a confirmação</h3>
                                <p className="text-sm text-muted-foreground">
                                    Assim que 5 amigos visitarem o link, seu desconto será ativado automaticamente
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-primary font-bold">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">Aproveite seu desconto</h3>
                                <p className="text-sm text-muted-foreground">
                                    O desconto será aplicado automaticamente no checkout
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reward Badge */}
                    <div className="bg-gradient-purple rounded-2xl p-6 shadow-glow">
                        <div className="flex flex-col items-center justify-center text-primary-foreground">
                            <Gift className="h-6 w-6 mb-2" />
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-medium">12x de</span>
                                <span className="text-5xl font-bold">R$ 14,13</span>
                            </div>
                        </div>
                        <p className="text-primary-foreground/80 text-sm mt-3">
                            Desconto pendente - aguardando 5 indicações
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="pt-4">
                        <Button
                            size="lg"
                            onClick={() => navigate('/plans')}
                            className="bg-card hover:bg-card/80 text-foreground border-2 border-primary/50 text-lg px-10 py-7 rounded-xl hover:scale-105 transition-transform"
                        >
                            Continuar para Planos
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>

                    {/* Fine Print */}
                    <p className="text-xs text-muted-foreground">
                        Você receberá um e-mail assim que seu desconto for ativado
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RewardClaimed;
