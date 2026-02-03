import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logoFull from "@/assets/logo-full.png";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${scrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg py-3"
          : "bg-transparent py-5"
        }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link
          to="/"
          className={`flex items-center hover:opacity-90 transition-all duration-300 ${scrolled ? "scale-90" : "scale-100"
            }`}
        >
          <img
            src={logoFull}
            alt="Meu Auxiliar"
            className={`transition-all duration-300 ${scrolled ? "h-8" : "h-10"
              }`}
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/auth">
            <Button
              className={`bg-gradient-purple shadow-glow transition-all duration-300 ${scrolled ? "px-6 py-2 text-sm" : "px-8 py-2.5"
                }`}
            >
              Entrar
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
