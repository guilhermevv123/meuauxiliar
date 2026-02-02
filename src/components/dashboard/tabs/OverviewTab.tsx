import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SummaryCards } from "../SummaryCards";
import { CategoryChart } from "../CategoryChart";
import { NetIncomeChart } from "../NetIncomeChart";
import { PeriodSelector } from "../PeriodSelector";
import { getFinanceiroByMonth } from "@/lib/api";
import { getSession } from "@/lib/session";

export const OverviewTab = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const queryClient = useQueryClient();
  const sessionId = getSession()?.sessionId ?? "";

  // Prefetch adjacent months for faster navigation
  useEffect(() => {
    if (!sessionId) return;

    const prefetchAdjacentMonths = async () => {
      // Calculate previous month
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      
      // Calculate next month
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;

      // Prefetch previous and next months
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ["financeiro", sessionId, prevYear, prevMonth],
          queryFn: () => getFinanceiroByMonth(sessionId, prevYear, prevMonth),
          staleTime: 5 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: ["financeiro", sessionId, nextYear, nextMonth],
          queryFn: () => getFinanceiroByMonth(sessionId, nextYear, nextMonth),
          staleTime: 5 * 60 * 1000,
        }),
      ]);
    };

    // Prefetch after a short delay to not interfere with current month loading
    const timer = setTimeout(prefetchAdjacentMonths, 500);
    return () => clearTimeout(timer);
  }, [month, year, sessionId, queryClient]);

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
