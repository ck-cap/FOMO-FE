import type { ChartData, ChartOptions } from 'chart.js'

export interface StockData {
  symbol: string;
  prices: number[];
  dates: string[];
  volumes: number[];
}

export interface ChartDataset {
  label: string;
  data: (number | null)[];
  borderColor: string;
  borderDash?: number[];
  tension?: number;
}

export type StockChartData = ChartData<'line', (number | null)[], string>

export type StockChartOptions = ChartOptions<'line'>