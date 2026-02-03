import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const FeedbackSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-20 md:py-32 flex flex-col items-center justify-center text-center">
        <div className="max-w-2xl w-full animate-scale-in">
          <div className="mb-8 flex justify-center">
            <div className="bg-primary/20 p-6 rounded-full relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse" />
              <CheckCircle2 className="h-20 w-20 text-primary relative z-10" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Obrigado pelo seu <br />
            <span className="bg-gradient-purple bg-clip-text text-transparent">Feedback!</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed">
            Sua opinião é fundamental para tornarmos o Meu Auxiliar cada vez melhor. 
            Em alguns segundos você será redirecionado para a página inicial.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate("/")}
              size="lg"
              className="bg-gradient-purple px-10 py-7 rounded-xl text-lg shadow-glow hover:scale-105 transition-transform group"
            >
              Voltar para Home
              <Home className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="border-2 px-10 py-7 rounded-xl text-lg hover:bg-primary/5 transition-transform"
            >
              Ir para o Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="mt-12 text-sm text-muted-foreground animate-pulse">
            Redirecionando automaticamente em 5 segundos...
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-12 bg-card/10 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Meu Auxiliar. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default FeedbackSuccess;
