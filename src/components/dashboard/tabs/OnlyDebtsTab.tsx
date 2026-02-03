export const OnlyDebtsTab = () => {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      {/* Banner de Manutenção em Tela Cheia */}
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 rounded-2xl p-12 text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-500/20 p-6 rounded-full">
              <svg className="w-16 h-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-4">
            🚧 Estamos Atualizando
          </h2>
          
          <p className="text-lg text-foreground mb-6 leading-relaxed">
            Esta funcionalidade está sendo <span className="font-bold text-primary">completamente reformulada</span> para oferecer:
          </p>
          
          <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-xl mt-1">✓</span>
              <p className="text-muted-foreground">Controle preciso de <span className="font-semibold text-foreground">pagamentos parciais</span></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-xl mt-1">✓</span>
              <p className="text-muted-foreground">Histórico completo de <span className="font-semibold text-foreground">todos os pagamentos</span></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-xl mt-1">✓</span>
              <p className="text-muted-foreground">Cálculos automáticos de <span className="font-semibold text-foreground">juros e multas</span></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-xl mt-1">✓</span>
              <p className="text-muted-foreground">Integração com <span className="font-semibold text-foreground">lembretes de vencimento</span></p>
            </div>
          </div>
          
          <div className="bg-card/50 rounded-xl p-6 border border-border/50">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-primary">Previsão de retorno:</span> Em breve!
              <br />
              Estamos trabalhando para trazer a melhor experiência de controle de dívidas.
            </p>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="https://wa.me/5573998538910?text=Olá!%20Gostaria%20de%20saber%20sobre%20a%20atualização%20da%20aba%20de%20dívidas" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlyDebtsTab;
