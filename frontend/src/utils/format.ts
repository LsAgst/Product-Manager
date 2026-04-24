export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function formatDateTime(value: string): string {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Data invalida";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
    .format(parsedDate)
    .replace(",", "");
}
