import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PeriodSelectorProps {
  month: number;
  year: number;
  onChangeMonth: (m: number) => void;
  onChangeYear: (y: number) => void;
}

const months = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
];

export const PeriodSelector = ({ month, year, onChangeMonth, onChangeYear }: PeriodSelectorProps) => {
  const prev = () => {
    const d = new Date(year, month - 1, 1);
    d.setMonth(d.getMonth() - 1);
    onChangeMonth(d.getMonth() + 1);
    onChangeYear(d.getFullYear());
  };
  const next = () => {
    const d = new Date(year, month - 1, 1);
    d.setMonth(d.getMonth() + 1);
    onChangeMonth(d.getMonth() + 1);
    onChangeYear(d.getFullYear());
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={prev}>←</Button>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground whitespace-nowrap">
          {months[month - 1]} {year}
        </h2>
        <Button variant="outline" size="sm" onClick={next}>→</Button>
      </div>
      <div className="flex items-center gap-2">
        <Select value={String(month)} onValueChange={(v) => onChangeMonth(Number(v))}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m, idx) => (
              <SelectItem key={m} value={String(idx + 1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => onChangeYear(Number(v))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
