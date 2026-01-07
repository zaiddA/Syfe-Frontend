import { useCallback, useEffect, useMemo, useState } from "react";
import { CACHE_KEY, DEFAULT_RATE, FxRateState } from "../utils/fx";

const STALE_MS = 1000 * 60 * 60 * 6;

const readCache = (): FxRateState | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FxRateState;
    if (typeof parsed.rate !== "number" || typeof parsed.fetchedAt !== "number") {
      return null;
    }
    return {
      ...parsed,
      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

const writeCache = (state: FxRateState) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(state));
  } catch {
    // Ignore cache write errors (private mode or quota limits).
  }
};

export const useExchangeRate = () => {
  const apiKey = import.meta.env.VITE_EXCHANGE_API_KEY as string | undefined;
  const apiBase = import.meta.env.VITE_EXCHANGE_API_BASE as string | undefined;
  const useMock = import.meta.env.VITE_USE_MOCK_FX === "true";

  const initialState = useMemo<FxRateState>(() => {
    const cached = readCache();
    if (cached) return { ...cached, source: "cache" };
    return {
      rate: DEFAULT_RATE,
      updatedAt: new Date().toISOString(),
      fetchedAt: Date.now(),
      source: "fallback",
    };
  }, []);

  const [rateState, setRateState] = useState<FxRateState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = useCallback(() => {
    if (useMock) return "/mock-fx.json";
    if (apiBase) return apiBase;
    if (!apiKey) return "";
    return `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
  }, [apiBase, apiKey, useMock]);

  const refresh = useCallback(async () => {
    const url = buildUrl();
    if (!url) {
      setError(
        "Missing exchange-rate API key. Add VITE_EXCHANGE_API_KEY or set VITE_USE_MOCK_FX=true."
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate");
      }
      const data = (await response.json()) as {
        conversion_rates?: { INR?: number };
        time_last_update_utc?: string;
      };
      const rate = data.conversion_rates?.INR;
      if (!rate || rate <= 0) {
        throw new Error("Invalid exchange-rate response");
      }
      const updatedAt = data.time_last_update_utc
        ? new Date(data.time_last_update_utc).toISOString()
        : new Date().toISOString();
      const nextState: FxRateState = {
        rate,
        updatedAt,
        fetchedAt: Date.now(),
        source: useMock ? "mock" : "live",
      };
      setRateState(nextState);
      writeCache(nextState);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to refresh rate");
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    const cached = readCache();
    if (!cached) {
      refresh();
      return;
    }
    const isStale = Date.now() - cached.fetchedAt > STALE_MS;
    if (isStale) {
      refresh();
    }
  }, [refresh]);

  return {
    rateState,
    loading,
    error,
    refresh,
    hasLiveRate: rateState.source === "live" || rateState.source === "mock",
  };
};
