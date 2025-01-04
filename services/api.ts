import { useRuntimeConfig } from 'nuxt/app';
import type { APIResponse, FetchOptions, StockData } from '../types/stock'

export const fetchPredictionData = async (options: FetchOptions): Promise<APIResponse> => {
  const config = useRuntimeConfig()
  try {
    const response = await fetch(
      `${config.public.apiBaseUrl}/predict?symbol=${options.symbol}&lookback_years=${options.lookbackYears}&forecast_days=${options.forecastDays}`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};
