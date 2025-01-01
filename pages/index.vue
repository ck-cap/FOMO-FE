<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-4">Stock Price Prediction</h1>

    <div class="bg-white rounded-lg shadow p-6">
      <!-- ... rest of your template ... -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Stock Symbol</label>
        <input 
          v-model="symbol"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter stock symbol (e.g., AAPL)"
        />
      </div>

      <button 
        @click="generatePrediction"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        :disabled="loading"
      >
        {{ loading ? 'Generating...' : 'Generate Prediction' }}
      </button>

      <div v-if="error" class="mt-4 text-red-600">
        {{ error }}
      </div>

      <div v-if="stockData" class="mt-6">
        <h2 class="text-xl font-semibold mb-4">Prediction Results</h2>
        <div class="h-[400px]">
          <Line
            v-if="chartData"
            :data="chartData"
            :options="chartOptions"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import type { StockData, StockChartData, StockChartOptions } from '~/types/stock'
import { fetchStockData } from '~/services/api'


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const symbol = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const stockData = ref<StockData | null>(null)

// Function to predict next prices using a simple algorithm
const predictNextPrices = (prices: number[], days: number = 30): number[] => {
  if (prices.length === 0) return []
  
  const lastPrice = prices[prices.length - 1]
  const predictedPrices: number[] = []
  
  for (let i = 0; i < days; i++) {
    // Simple random walk prediction with trend
    const trend = i < 15 ? 0.001 : -0.001 // Slight upward trend then downward
    const volatility = 0.02 // 2% daily volatility
    const randomChange = (Math.random() - 0.5) * volatility
    const priceChange = lastPrice * (randomChange + trend)
    
    const previousPrice = i === 0 ? lastPrice : predictedPrices[i - 1]
    const newPrice = previousPrice + priceChange
    predictedPrices.push(newPrice)
  }
  
  return predictedPrices
}

// Function to generate future dates
const generateFutureDates = (lastDate: string, days: number = 30): string[] => {
  const dates: string[] = []
  const currentDate = new Date(lastDate)
  
  for (let i = 0; i < days; i++) {
    currentDate.setDate(currentDate.getDate() + 1)
    
    // Skip weekends
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

const generatePrediction = async () => {
  if (!symbol.value) {
    error.value = 'Please enter a stock symbol'
    return
  }

  loading.value = true
  error.value = null

  try {
    stockData.value = await fetchStockData(symbol.value)
  } catch (err) {
    error.value = 'Failed to generate prediction'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>