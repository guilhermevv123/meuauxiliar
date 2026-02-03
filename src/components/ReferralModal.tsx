import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Gift, Share2, Users } from 'lucide-react';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    onClaim: () => void;
    onDecline: () => void;
}

const ReferralModal = ({ isOpen, onClose, onClaim, onDecline }: ReferralModalProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="relative bg-card border-2 border-primary/20 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* Content */}
                    <div className="p-8 text-center space-y-6">
                        {/* Icon */}
                        <div className="mx-auto w-20 h-20 bg-gradient-purple rounded-full flex items-center justify-center shadow-glow">
                            <Gift className="h-10 w-10 text-primary-foreground" />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">
                                🎉 Ganhe Desconto!
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Compartilhe com amigos e economize
                            </p>
                        </div>

                        {/* Offer Details */}
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <Users className="h-6 w-6 text-primary" />
                                <span className="text-xl font-semibold">Indique 5 amigos</span>
                            </div>

                            <div className="text-4xl font-bold bg-gradient-purple bg-clip-text text-transparent">
                                Ganhe Desconto!
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Compartilhe o link do Meu Auxiliar com 5 amigos e ganhe um <strong>desconto especial</strong> na sua assinatura anual!
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <Button
                                size="lg"
                                onClick={onClaim}
                                className="w-full bg-gradient-purple shadow-glow text-lg py-6 rounded-xl hover:scale-105 transition-transform"
                            >
                                <Share2 className="mr-2 h-5 w-5" />
                                Resgatar Recompensa
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                onClick={onDecline}
                                className="w-full text-base py-6 rounded-xl hover:scale-105 transition-transform"
                            >
                                Continuar sem desconto
                            </Button>
                        </div>

                        {/* Fine Print */}
                        <p className="text-xs text-muted-foreground">
                            * Desconto válido após confirmação das 5 indicações
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ReferralModal;
