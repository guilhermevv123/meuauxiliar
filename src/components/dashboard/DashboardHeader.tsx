import { Button } from "@/components/ui/button";
import { User, Settings, LogOut } from "lucide-react";
import logoFull from "@/assets/logo-full.png";
import logoIcon from "@/assets/logo-icon.png";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const DashboardHeader = () => {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-card sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Light mode: white logo enviada; Dark mode: logo atual */}
          <img src={logoFull} alt="Meu Auxiliar" className="h-12 sm:h-14 dark:hidden object-contain" />
          <img src={logoIcon} alt="Meu Auxiliar" className="h-12 sm:h-14 hidden dark:block object-contain transform scale-[2]" />
          <span className="text-base sm:text-lg font-bold hidden xs:inline">Meu Auxiliar</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <ThemeToggle />
          <Link to="/profile" className="hidden sm:inline-block">
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/settings" className="hidden sm:inline-block">
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
