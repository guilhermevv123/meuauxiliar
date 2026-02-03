import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <Link to="/auth" className="text-sm text-primary hover:underline">Voltar</Link>
        </div>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Termos de Uso</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none text-muted-foreground">
            <p>Bem-vindo ao Meu Auxiliar. Ao utilizar nossos serviços, você concorda com estes Termos de Uso. Leia com atenção.</p>
            <h3>1. Conta</h3>
            <p>Você é responsável por manter a confidencialidade das suas credenciais e por todas as atividades realizadas na sua conta.</p>
            <h3>2. Privacidade</h3>
            <p>Tratamos seus dados conforme nossa Política de Privacidade. Utilizamos provedores como Supabase para armazenamento seguro.</p>
            <h3>3. Uso Aceitável</h3>
            <ul>
              <li>Não utilizar o serviço para atividades ilegais.</li>
              <li>Não tentar acessar dados de outros usuários.</li>
              <li>Respeitar limites de uso e recursos disponibilizados.</li>
            </ul>
            <h3>4. Pagamentos</h3>
            <p>Serviços pagos, quando aplicáveis, serão informados previamente. Cancelamentos seguem nossa política vigente.</p>
            <h3>5. Disponibilidade</h3>
            <p>Nos esforçamos para manter o serviço disponível, mas interrupções podem ocorrer para manutenção ou eventos fora do nosso controle.</p>
            <h3>6. Alterações</h3>
            <p>Podemos atualizar estes termos a qualquer momento. A versão mais recente estará sempre disponível nesta página.</p>
            <h3>7. Contato</h3>
            <p>Em caso de dúvidas, entre em contato pelo suporte informado no aplicativo.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
