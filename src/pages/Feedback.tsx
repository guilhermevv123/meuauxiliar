import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Heart, Star, Sparkles, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const Feedback = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "suggestion",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting to insert feedback:', { 
        nome: formData.name, 
        email: formData.email, 
        mensagem: formData.message, 
        assunto: formData.type 
      });
      
      const { data, error } = await (supabase as any)
        .from('feedbacks')
        .insert([
          { 
            nome: formData.name, 
            email: formData.email, 
            mensagem: formData.message, 
            assunto: formData.type 
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Insert successful, data:', data);

      toast({
        title: "Feedback enviado!",
        description: "Obrigado por nos ajudar a melhorar o Meu Auxiliar.",
      });
      navigate("/feedback/success");
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Ocorreu um erro ao enviar seu feedback. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-foreground flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-20 md:py-32 flex flex-col items-center">
        <div className="max-w-3xl w-full">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Sua opinião importa <br />
              <span className="bg-gradient-purple bg-clip-text text-transparent">Queremos te ouvir!</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Como tem sido sua experiência com o Meu Auxiliar? Conte-nos o que você está achando, 
              o que podemos melhorar ou compartilhe aquela ideia incrível.
            </p>
          </div>

          <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-3xl p-8 md:p-12 shadow-luxury animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium ml-1">Seu Nome</label>
                  <Input 
                    id="name"
                    placeholder="Como podemos te chamar?"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-background/50 border-border/50 rounded-xl py-6"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium ml-1">E-mail</label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-background/50 border-border/50 rounded-xl py-6"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Sobre o que você quer falar?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'suggestion', label: 'Sugestão', icon: Sparkles },
                    { id: 'compliment', label: 'Elogio', icon: Heart },
                    { id: 'issue', label: 'Problema', icon: AlertCircle },
                    { id: 'idea', label: 'Ideia', icon: Star },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFormData({...formData, type: item.id})}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        formData.type === item.id 
                          ? 'bg-gradient-purple text-primary-foreground border-transparent shadow-glow' 
                          : 'bg-background/50 border-border/50 hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      <item.icon className={`h-6 w-6 mb-2 ${formData.type === item.id ? 'text-white' : ''}`} />
                      <span className="text-xs font-bold uppercase tracking-wider">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium ml-1">Sua Mensagem</label>
                <Textarea 
                  id="message"
                  placeholder="Conte-nos tudo... o que gostou, o que falta, o que podemos mudar?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="min-h-[150px] bg-background/50 border-border/50 rounded-2xl p-4"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-purple py-8 rounded-2xl text-lg font-bold shadow-glow hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
              >
                {loading ? "Enviando..." : (
                  <>
                    Enviar Feedback
                    <Send className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-12 text-center text-muted-foreground animate-fade-in delay-300">
            <p className="flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Sua voz nos ajuda a construir o melhor assistente do Brasil.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-12 bg-card/10">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Meu Auxiliar. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Feedback;
