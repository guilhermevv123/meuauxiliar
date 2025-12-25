import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, PieChart, Filter, FileSpreadsheet, Shield, MessageSquare, Calendar, Zap, Star, Check } from "lucide-react";
import { Link } from "react-router-dom";
import logoFull from "@/assets/logo-full.png";
import screenshot1 from "@/assets/screenshot-1.png";
import screenshot2 from "@/assets/screenshot-2.png";
import Navbar from "@/components/Navbar";

// Screenshots do sistema interno
import dashboardScreenshot from "/screenshots/dashboard.png";
import categoriasScreenshot from "/screenshots/categorias.png";
import agendaScreenshot from "/screenshots/agenda.png";
import dividasScreenshot from "/screenshots/dividas.png";

const Landing = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section (estilo mais comercial) */}
      <section className="container mx-auto px-4 py-28 md:py-32 relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Removed decorative background for a clean hero focused on the robot */}

        <div className="max-w-5xl mx-auto w-full animate-fade-in relative z-10">
          <div className="flex flex-col items-center text-center space-y-6">
            <h1 className="font-extrabold tracking-tight leading-tight text-5xl md:text-6xl lg:text-7xl">
              Tenha um auxiliar pessoal
              <span className="block bg-gradient-purple bg-clip-text text-transparent">Trabalhando 24h por dia pra você</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Você ainda tá tentando lembrar tudo de cabeça ou não sabe pra onde está indo seu dinheiro?
            </p>
            <div className="flex gap-4 justify-center flex-wrap pt-1">
              <Link to="/auth" className="group">
                <Button size="lg" className="bg-gradient-purple shadow-glow transition-transform text-lg px-10 py-7 rounded-xl group-hover:scale-105 active:scale-95">
                  Começar agora
                  <ArrowRight className="ml-2 h-5 w-5 transition transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 hover:bg-primary/5 text-lg px-10 py-7 rounded-xl active:scale-95"
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Saiba mais
              </Button>
              
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span>Cadastro gratuito • Sem cartão de crédito</span>
            </div>
          </div>
        </div>
      </section>

      {/* Faixa de benefícios curtos alinhados ao Meu Auxiliar */}
      <section className="w-full bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold">+ Lembretes inteligentes</p>
            <p className="text-muted-foreground">Agenda automática de compromissos e prazos</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">+ Registro automático</p>
            <p className="text-muted-foreground">Gastos e entradas pelo WhatsApp, sem planilhas</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">+ Seu dinheiro no controle</p>
            <p className="text-muted-foreground">Saldo, entradas e saídas em um dashboard claro</p>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Veja o Meu Auxiliar em ação
            </h2>
            <p className="text-xl text-muted-foreground">
              Descubra como é fácil gerenciar suas finanças pelo WhatsApp
            </p>
          </div>
          
          {/* iPhone Mockup with Video */}
          <div className="relative mx-auto max-w-sm">
            <div className="relative z-10">
              {/* iPhone Frame */}
              <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-black rounded-b-3xl z-20"></div>
                
                {/* Screen */}
                <div className="relative bg-white rounded-[2.5rem] overflow-hidden">
                  <img 
                    src={screenshot1} 
                    alt="Demonstração do Meu Auxiliar" 
                    className="w-full h-auto"
                  />
                </div>
                
                {/* Power Button */}
                <div className="absolute right-0 top-32 w-1 h-16 bg-black/50 rounded-l"></div>
                
                {/* Volume Buttons */}
                <div className="absolute left-0 top-28 w-1 h-8 bg-black/50 rounded-r"></div>
                <div className="absolute left-0 top-40 w-1 h-8 bg-black/50 rounded-r"></div>
              </div>
            </div>
            
            {/* Glow Effect */}
            <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
              <div className="absolute inset-0 bg-gradient-purple"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="container mx-auto px-4 py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Como funciona?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Gerencie suas finanças de forma natural, conversando pelo WhatsApp
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            {/* iPhone Mockup 1 */}
            <div className="order-2 md:order-1 flex justify-center">
              <div className="relative max-w-xs w-full">
                <div className="relative z-10">
                  <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-20"></div>
                    <div className="relative bg-white rounded-[2.5rem] overflow-hidden">
                      <img 
                        src={screenshot1} 
                        alt="Registro de gastos pelo WhatsApp" 
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="absolute right-0 top-28 w-1 h-12 bg-black/50 rounded-l"></div>
                    <div className="absolute left-0 top-24 w-1 h-6 bg-black/50 rounded-r"></div>
                    <div className="absolute left-0 top-32 w-1 h-6 bg-black/50 rounded-r"></div>
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 blur-3xl opacity-20">
                  <div className="absolute inset-0 bg-gradient-purple"></div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Registre gastos instantaneamente</h3>
                  <p className="text-muted-foreground">
                    Simplesmente converse com seu assistente e registre transações de forma natural. 
                    O sistema entende suas mensagens e organiza tudo automaticamente.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Acompanhe em tempo real</h3>
                  <p className="text-muted-foreground">
                    Veja seu saldo, entradas e saídas atualizados instantaneamente. 
                    Relatórios detalhados e gráficos profissionais sempre à mão.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Agende compromissos</h3>
                  <p className="text-muted-foreground">
                    Nunca mais esqueça reuniões ou pagamentos importantes. 
                    Configure lembretes personalizados e receba notificações no momento certo.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Dados protegidos</h3>
                  <p className="text-muted-foreground">
                    Seus dados financeiros são criptografados e armazenados com segurança máxima. 
                    Backup automático para você nunca perder informações.
                  </p>
                </div>
              </div>
            </div>
            
            {/* iPhone Mockup 2 */}
            <div className="flex justify-center">
              <div className="relative max-w-xs w-full">
                <div className="relative z-10">
                  <div className="relative bg-black rounded-[3rem] p-3 shadow-2xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-3xl z-20"></div>
                    <div className="relative bg-white rounded-[2.5rem] overflow-hidden">
                      <img 
                        src={screenshot2} 
                        alt="Agendamento de compromissos" 
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="absolute right-0 top-28 w-1 h-12 bg-black/50 rounded-l"></div>
                    <div className="absolute left-0 top-24 w-1 h-6 bg-black/50 rounded-r"></div>
                    <div className="absolute left-0 top-32 w-1 h-6 bg-black/50 rounded-r"></div>
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 blur-3xl opacity-20">
                  <div className="absolute inset-0 bg-gradient-purple"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Showcase */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Veja como é por dentro</h2>
          <p className="text-xl text-muted-foreground">Conheça as principais funcionalidades do sistema</p>
        </div>

        <div className="max-w-6xl mx-auto rounded-3xl bg-card/30 border border-border/50 p-6 md:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Interactive Tabs */}
            <div className="space-y-4">
              {[
                {
                  id: 'dashboard',
                  title: 'Dashboard Completo',
                  description: 'Visão geral das suas finanças com saldo, entradas, saídas e gráficos detalhados.',
                  icon: TrendingUp,
                  image: dashboardScreenshot
                },
                {
                  id: 'categorias',
                  title: 'Categorias Organizadas',
                  description: 'Organize suas despesas e receitas por categorias personalizadas para melhor controle.',
                  icon: PieChart,
                  image: categoriasScreenshot
                },
                {
                  id: 'agenda',
                  title: 'Agenda Inteligente',
                  description: 'Calendário integrado com compromissos e lembretes financeiros automáticos.',
                  icon: Calendar,
                  image: agendaScreenshot
                },
                {
                  id: 'dividas',
                  title: 'Gestão de Dívidas',
                  description: 'Acompanhe e gerencie suas dívidas com progresso visual de pagamentos.',
                  icon: FileSpreadsheet,
                  image: dividasScreenshot
                }
              ].map((feature, index) => {
                const isActive = activeFeature === index;
                return (
                  <div
                    key={feature.id}
                    className={`cursor-pointer transition-all duration-300 rounded-2xl p-6 border ${
                      isActive 
                        ? 'bg-card border-primary/50 shadow-glow scale-[1.02]' 
                        : 'bg-transparent border-transparent hover:bg-card/50'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl transition-colors ${
                        isActive ? 'bg-gradient-purple text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold mb-2 transition-colors ${
                          isActive ? 'text-primary' : 'text-foreground'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Feature Preview */}
            <div className="relative h-[400px] md:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-black/50">
              {[
                  dashboardScreenshot,
                  categoriasScreenshot,
                  agendaScreenshot,
                  dividasScreenshot
              ].map((img, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                    activeFeature === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                  <img 
                    src={img} 
                    alt={`Feature preview ${index}`} 
                    className="w-full h-full object-contain p-4 md:p-8"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Recursos poderosos para seu controle financeiro
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para organizar suas finanças em uma única plataforma
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow group">
            <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Visão Geral Completa</h3>
            <p className="text-muted-foreground">
              Acompanhe entradas, saídas e saldo em tempo real com gráficos intuitivos e profissionais.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow group">
            <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PieChart className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Categorias Personalizadas</h3>
            <p className="text-muted-foreground">
              Crie, edite e organize suas categorias de gastos do jeito que funciona melhor para você.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow group">
            <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Filter className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Filtros Inteligentes</h3>
            <p className="text-muted-foreground">
              Filtre por categoria, período ou qualquer critério para análises precisas e detalhadas.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow group">
            <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Relatórios Excel</h3>
            <p className="text-muted-foreground">
              Importe e exporte dados do Google Sheets para análises avançadas e backup seguro.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow group">
            <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Segurança Garantida</h3>
            <p className="text-muted-foreground">
              Seus dados financeiros protegidos com criptografia e backup automático.
            </p>
          </div>

          <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50 hover:border-primary/50 transition-all hover:shadow-glow group">
            <div className="h-12 w-12 bg-gradient-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">WhatsApp Integrado</h3>
            <p className="text-muted-foreground">
              Gerencie tudo pelo WhatsApp. Sem apps extras, sem complicação.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-20 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Milhares de pessoas já confiam no Meu Auxiliar
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-500 text-2xl mb-4">
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
              <Star className="w-8 h-8 fill-current" />
            </div>
            <p className="text-xl text-muted-foreground">
              Avaliação 5.0 de nossos usuários
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50">
              <div className="flex items-center gap-2 text-yellow-500 mb-4">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-muted-foreground mb-4">
                "Finalmente consigo controlar meus gastos sem complicação. O sistema pelo WhatsApp é genial!"
              </p>
              <p className="font-bold">Maria Silva</p>
              <p className="text-sm text-muted-foreground">Empreendedora</p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50">
              <div className="flex items-center gap-2 text-yellow-500 mb-4">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-muted-foreground mb-4">
                "Nunca mais esqueço de pagar contas. Os lembretes automáticos salvaram minha vida financeira!"
              </p>
              <p className="font-bold">João Santos</p>
              <p className="text-sm text-muted-foreground">Profissional Liberal</p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-luxury border border-border/50">
              <div className="flex items-center gap-2 text-yellow-500 mb-4">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-muted-foreground mb-4">
                "Os relatórios são incríveis! Agora sei exatamente para onde vai meu dinheiro."
              </p>
              <p className="font-bold">Ana Paula</p>
              <p className="text-sm text-muted-foreground">Gestora Financeira</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-purple p-12 md:p-16 rounded-3xl shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTR2NGgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
              Pronto para transformar sua vida financeira?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que já tomaram controle total de suas finanças. 
              Comece gratuitamente hoje mesmo!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="hover:scale-105 transition-transform text-lg px-8 py-6">
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Configuração em 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Cancele quando quiser</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Meu Auxiliar. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
