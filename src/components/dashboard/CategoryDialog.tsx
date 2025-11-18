import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, ShoppingCart, Car, Zap, Coffee, Heart, Briefcase, Film } from "lucide-react";
import { cn } from "@/lib/utils";

const iconOptions = [
  { name: "Casa", icon: Home },
  { name: "Compras", icon: ShoppingCart },
  { name: "Transporte", icon: Car },
  { name: "Utilidades", icon: Zap },
  { name: "Lazer", icon: Coffee },
  { name: "Saúde", icon: Heart },
  { name: "Trabalho", icon: Briefcase },
  { name: "Entretenimento", icon: Film },
];

interface Category {
  name: string;
  icon: any;
  spent: number;
  budget: number;
  color: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category;
  onSave: (category: Category) => void;
}

export const CategoryDialog = ({ open, onOpenChange, category, onSave }: CategoryDialogProps) => {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    icon: category?.icon || Home,
    budget: category?.budget || 0,
    color: category?.color || "#7C3AED",
  });

  const handleSubmit = () => {
    onSave({
      ...formData,
      spent: category?.spent || 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: option.icon })}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all hover:bg-accent",
                      formData.icon === option.icon ? "border-primary bg-accent" : "border-border"
                    )}
                  >
                    <Icon className="h-6 w-6 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Orçamento</Label>
            <Input type="number" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })} />
          </div>
          <div className="space-y-2">
            <Label>Cor</Label>
            <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
