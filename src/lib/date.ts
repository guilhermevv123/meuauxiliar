export function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  
  console.log('📅 getMonthRange:', {
    year,
    month,
    start: start.toISOString(),
    end: end.toISOString(),
    startDate: start.toLocaleDateString('pt-BR'),
    endDate: end.toLocaleDateString('pt-BR')
  });
  
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}
