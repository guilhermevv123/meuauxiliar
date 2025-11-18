import { useState } from "react";
import { SummaryCards } from "../SummaryCards";
import { CategoryChart } from "../CategoryChart";
import { NetIncomeChart } from "../NetIncomeChart";
import { PeriodSelector } from "../PeriodSelector";

export const OverviewTab = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  return (
    <>
      <PeriodSelector month={month} year={year} onChangeMonth={setMonth} onChangeYear={setYear} />
      <SummaryCards month={month} year={year} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <NetIncomeChart month={month} year={year} />
        <CategoryChart month={month} year={year} />
      </div>
    </>
  );
};
