export interface StockData {
  ticker: string;
  predicted_prices: number[][];
  forecast_days: number;
  graph: string;
}

export interface APIResponse {
  success: boolean;
  data: StockData | null;
  error?: string;
}

export interface FetchOptions {
  symbol: string;
  lookbackYears: string | number;
  forecastDays: string | number;
}
