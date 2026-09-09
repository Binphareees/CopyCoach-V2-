import { getIntlLocale, type LocaleCode } from "./config";

export function formatDate(code: LocaleCode, date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(getIntlLocale(code), options).format(new Date(date));
}

export function formatNumber(code: LocaleCode, value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(getIntlLocale(code), options).format(value);
}

export function formatCurrency(code: LocaleCode, amount: number, currency = "USD", options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(getIntlLocale(code), {
    style: "currency",
    currency,
    ...options,
  }).format(amount);
}