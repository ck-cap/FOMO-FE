import type { ChartData, ChartOptions } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

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

export interface ExtendedChartOptions extends ChartOptions<'line'> {
  plugins?: {
    zoom?: typeof zoomPlugin['defaults'];
  } & NonNullable<ChartOptions<'line'>['plugins']>;
}

export type StockChartData = ChartData<'line', (number | null)[], string>;

export type StockChartOptions = ExtendedChartOptions;