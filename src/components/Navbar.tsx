import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoFull from "@/assets/logo-full.png";

const Navbar = () => {
  const lastY = useRef(0);
  const [scaleClass, setScaleClass] = useState("scale-100 opacity-100");

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      const down = y > lastY.current;
      setScaleClass(down ? "scale-95 opacity-95" : "scale-100 opacity-100");
      lastY.current = y;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-out ${scaleClass}`}>
      <div className="backdrop-blur-lg bg-background/50 border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src={logoFull} alt="Meu Auxiliar" className="h-10" />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="hidden sm:inline-flex">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-purple">Começar Grátis</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

