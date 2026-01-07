import type { Currency } from "../types";

export type FxRateState = {
  rate: number;
  updatedAt: string;
  fetchedAt: number;
  source: "live" | "cache" | "fallback" | "mock";
};

export const DEFAULT_RATE = 83;
export const CACHE_KEY = "syfe.fxRate";

export const toUsd = (amount: number, currency: Currency, usdToInr: number) => {
  if (currency === "USD") return amount;
  if (usdToInr <= 0) return amount;
  return amount / usdToInr;
};

export const toInr = (amount: number, currency: Currency, usdToInr: number) => {
  if (currency === "INR") return amount;
  return amount * usdToInr;
};

export const toOtherCurrency = (
  amount: number,
  currency: Currency,
  usdToInr: number
) => {
  return currency === "USD"
    ? toInr(amount, currency, usdToInr)
    : toUsd(amount, currency, usdToInr);
};

export const otherCurrency = (currency: Currency): Currency => {
  return currency === "USD" ? "INR" : "USD";
};

export const clamp = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
};
