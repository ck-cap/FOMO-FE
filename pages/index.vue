<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Stock Price Prediction</h1>

    <div class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Stock Symbol</label>
          <input 
            v-model="symbol"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter stock symbol (e.g., AAPL)"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <input 
            v-model="dateRange.startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <input 
            v-model="dateRange.endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <!-- Preset Date Range Buttons -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="preset in datePresets"
          :key="preset.label"
          @click="applyDatePreset(preset)"
          class="px-3 py-1 text-sm rounded-md transition-colors"
          :class="[
            isActivePreset(preset) 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          {{ preset.label }}
        </button>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Data Interval</label>
        <select 
          v-model="interval"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="1d">Daily</option>
          <option value="1wk">Weekly</option>
          <option value="1mo">Monthly</option>
        </select>
      </div>

      <div class="flex gap-4">
        <button 
          @click="generatePrediction"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          :disabled="loading"
        >
          {{ loading ? 'Generating...' : 'Generate Prediction' }}
        </button>

        <button 
          @click="resetZoom"
          class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          :disabled="!stockData"
        >
          Reset Zoom
        </button>
      </div>

      <div v-if="error" class="mt-4 text-red-600">
        {{ error }}
      </div>

      <div v-if="stockData" class="mt-6">
        <h2 class="text-xl font-semibold mb-4">Prediction Results</h2>
        <div class="h-[400px]">
          <ClientOnly>
          <Line
            v-if="chartData"
            :data="chartData"
            :options="chartOptions"
            ref="chartRef"
          />
        </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import type { StockData, StockChartData, StockChartOptions } from '~/types/stock'
import { fetchStockData } from '~/services/api'

interface DatePreset {
  label: string
  days: number
  interval: '1d' | '1wk' | '1mo'
}

const datePresets: DatePreset[] = [
  { label: '1W', days: 7, interval: '1d' },
  { label: '1M', days: 30, interval: '1d' },
  { label: '3M', days: 90, interval: '1d' },
  { label: '6M', days: 180, interval: '1wk' },
  { label: '1Y', days: 365, interval: '1wk' },
  { label: '2Y', days: 730, interval: '1mo' },
  { label: '5Y', days: 1825, interval: '1mo' }
]

const symbol = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const stockData = ref<StockData | null>(null)
const chartRef = ref<any>(null)
const activePreset = ref<DatePreset | null>(null)

const dateRange = ref({
  startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0]
})
const interval = ref<'1d' | '1wk' | '1mo'>('1d')

// Apply preset date range
const applyDatePreset = (preset: DatePreset) => {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - preset.days)
  
  dateRange.value = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
  
  interval.value = preset.interval
  activePreset.value = preset
}

// Check if a preset is currently active
const isActivePreset = (preset: DatePreset): boolean => {
  if (!activePreset.value) return false
  return activePreset.value.label === preset.label
}

// Reset active preset when dates are manually changed
watch([() => dateRange.value.startDate, () => dateRange.value.endDate], () => {
  activePreset.value = null
})

const predictNextPrices = (prices: number[], days: number = 30): number[] => {
  if (prices.length === 0) return []
  
  const lastPrice = prices[prices.length - 1]
  const predictedPrices: number[] = []
  
  for (let i = 0; i < days; i++) {
    const trend = i < 15 ? 0.001 : -0.001
    const volatility = 0.02
    const randomChange = (Math.random() - 0.5) * volatility
    const priceChange = lastPrice * (randomChange + trend)
    
    const previousPrice = i === 0 ? lastPrice : predictedPrices[i - 1]
    const newPrice = previousPrice + priceChange
    predictedPrices.push(newPrice)
  }
  
  return predictedPrices
}

const generateFutureDates = (lastDate: string, days: number = 30): string[] => {
  const dates: string[] = []
  const currentDate = new Date(lastDate)
  
  for (let i = 0; i < days; i++) {
    currentDate.setDate(currentDate.getDate() + 1)
    while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    dates.push(currentDate.toISOString().split('T')[0])
  }
  
  return dates
}

const chartData = computed<StockChartData>(() => {
  if (!stockData.value) return {
    labels: [],
    datasets: []
  }

  const historicalPrices = stockData.value.prices
  const predictedPrices = predictNextPrices(historicalPrices)
  const futureDates = generateFutureDates(stockData.value.dates[stockData.value.dates.length - 1])

  return {
    labels: [...stockData.value.dates, ...futureDates],
    datasets: [
      {
        label: 'Historical Prices',
        data: [...historicalPrices, null, ...Array(29).fill(null)],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Predicted Prices',
        data: [...Array(historicalPrices.length).fill(null), historicalPrices[historicalPrices.length - 1], ...predictedPrices],
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        tension: 0.1
      }
    ]
  }
})

const chartOptions = computed<StockChartOptions>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    
    legend: {
      position: 'top',
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
      },
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
        mode: 'x',
      }
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'Price ($)'
      }
    }
  }
}))

const resetZoom = () => {
  if (chartRef.value) {
    chartRef.value.resetZoom()
  }
}

const generatePrediction = async () => {
  if (!symbol.value) {
    error.value = 'Please enter a stock symbol'
    return
  }

  if (!dateRange.value.startDate || !dateRange.value.endDate) {
    error.value = 'Please select both start and end dates'
    return
  }

  if (new Date(dateRange.value.endDate) < new Date(dateRange.value.startDate)) {
    error.value = 'End date must be after start date'
    return
  }

  loading.value = true
  error.value = null

  try {
    stockData.value = await fetchStockData(symbol.value, {
      startDate: dateRange.value.startDate,
      endDate: dateRange.value.endDate,
      interval: interval.value
    })
  } catch (err) {
    error.value = 'Failed to generate prediction'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>