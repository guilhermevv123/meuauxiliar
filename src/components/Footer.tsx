import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/20">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Meu Auxiliar
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu assistente financeiro inteligente.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Produto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/features" className="hover:text-foreground">Recursos</Link></li>
              <li><Link to="/plans" className="hover:text-foreground">Planos</Link></li>
              <li><Link to="/empresas" className="hover:text-foreground">Para Empresas</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Suporte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/help" className="hover:text-foreground">Central de Ajuda</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contato</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t text-sm text-muted-foreground">
          <p>&copy; 2026 Meu Auxiliar. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
