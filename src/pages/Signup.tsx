import { useEffect } from "react";

const Signup = () => {
  // Redirecionar automaticamente para WhatsApp ao carregar a página
  useEffect(() => {
    const whatsappNumber = "5573998538910";
    const message = `Olá! Gostaria de criar uma conta no Meu Auxiliar.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.location.href = whatsappUrl;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="text-center text-white">
        <p className="text-lg">Redirecionando para o WhatsApp...</p>
      </div>
    </div>
  );
};

export default Signup;
