<template>
  <div class="container mx-auto px-4 py-8">
    <Card class="bg-white rounded-lg shadow">
      <CardHeader>
        <CardTitle class="text-2xl font-bold">Stock Price Prediction</CardTitle>
      </CardHeader>
      
      <!-- Market Status Indicator -->
      <div 
        v-if="liveData" 
        class="fixed top-4 right-4 flex items-center space-x-2 p-2 rounded-lg shadow-lg"
        :class="[
          liveData.market_status.state === 'OPEN' 
            ? 'bg-green-100 dark:bg-green-900' 
            : 'bg-gray-100 dark:bg-gray-900'
        ]"
      >
        <div class="relative">
          <div 
            class="w-3 h-3 rounded-full"
            :class="[
              liveData.market_status.state === 'OPEN' 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-gray-500'
            ]"
          />
          <div 
            v-if="liveData.market_status.state === 'OPEN'"
            class="absolute -inset-1 bg-green-500 rounded-full animate-ping opacity-20"
          />
        </div>
        <span class="text-sm font-medium">
          Market {{ liveData.market_status.state }}
          <span v-if="liveData.market_status.state === 'CLOSED' && liveData.market_status.next_open" 
                class="text-xs ml-1">
            (Opens {{ formatNextOpen(liveData.market_status.next_open) }})
          </span>
        </span>
      </div>

      <CardContent>
        <!-- Main Grid Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Left Column: Stock Info and Controls -->
          <div class="space-y-8">
            <!-- Selected Stock Info -->
            <div v-if="liveData">
              <div class="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <!-- Company Logo -->
                <div class="w-16 h-16 flex items-center justify-center bg-white rounded-lg p-2">
                  <img 
                    :src="`/company-logos/${formInputs.symbol.toLowerCase()}.svg`" 
                    :alt="`${formInputs.symbol} logo`"
                    class="w-full h-full object-contain"
                    @error="handleImageError"
                  />
                </div>
                
                <!-- Company Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <h3 class="text-xl font-semibold">{{ liveData.company_name }}</h3>
                    <Badge 
                      :variant="liveData.market_status.state === 'OPEN' ? 'default' : 'secondary'"
                      class="animate-fade-in"
                    >
                      {{ liveData.market_status.state }}
                    </Badge>
                  </div>
                  
                  <!-- Price Information -->
                  <div class="grid grid-cols-1 gap-4 mt-4">
                    <div>
                      <span class="text-sm text-muted-foreground">Current Price</span>
                      <p class="text-2xl font-bold">${{ liveData.current_price.toFixed(2) }}</p>
                      <span class="text-xs text-muted-foreground">
                        Previous Close: ${{ liveData.previous_close.toFixed(2) }}
                      </span>
                    </div>
                    <div>
                      <span class="text-sm text-muted-foreground">Change</span>
                      <div class="flex items-center space-x-2">
                        <ArrowUp 
                          v-if="liveData.price_change > 0" 
                          class="w-4 h-4 text-green-500"
                        />
                        <ArrowDown 
                          v-if="liveData.price_change < 0" 
                          class="w-4 h-4 text-red-500"
                        />
                        <p 
                          class="text-lg font-semibold"
                          :class="{
                            'text-green-500': liveData.price_change > 0,
                            'text-red-500': liveData.price_change < 0
                          }"
                        >
                          {{ liveData.price_change > 0 ? '+' : '' }}{{ liveData.price_change.toFixed(2) }}
                          ({{ liveData.price_change_percent.toFixed(2) }}%)
                        </p>
                      </div>
                    </div>
                    <div>
                      <span class="text-sm text-muted-foreground">Volume</span>
                      <p class="text-lg font-semibold">{{ formatNumber(liveData.volume) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input Form -->
            <form @submit.prevent="generatePrediction" class="space-y-6">
              <div class="grid grid-cols-1 gap-4">
                <div class="space-y-2">
                  <Label for="symbol">Stock Symbol</Label>
                  <Select 
                    v-model="formInputs.symbol"
                    @update:modelValue="handleTickerChange"
                  >
                    <SelectTrigger id="symbol" class="w-full">
                      <SelectValue placeholder="Select stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="ticker in availableTickers" 
                        :key="ticker" 
                        :value="ticker"
                      >
                        {{ ticker }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label for="lookback">Lookback Period</Label>
                  <Select 
                    v-model="formInputs.lookbackYears"
                    @update:modelValue="handleFormChange"
                  >
                    <SelectTrigger id="lookback" class="w-full">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Year</SelectItem>
                      <SelectItem value="2">2 Years</SelectItem>
                      <SelectItem value="3">3 Years</SelectItem>
                      <SelectItem value="5">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div class="space-y-2">
                  <Label for="forecast">Forecast Days</Label>
                  <Input 
                    id="forecast"
                    v-model="formInputs.forecastDays"
                    type="number"
                    min="1"
                    max="90"
                    placeholder="e.g., 30"
                    class="w-full"
                    @change="handleFormChange"
                    required
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-4">
                <Button 
                  type="submit" 
                  :disabled="isLoading"
                >
                  <Loader2 
                    v-if="isLoading" 
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  {{ isLoading ? 'Processing...' : 'Generate Prediction' }}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline"
                  @click="resetForm"
                  :disabled="isLoading"
                >
                  Reset
                </Button>
              </div>
            </form>

            <!-- Error Display -->
            <Alert 
              v-if="error" 
              variant="destructive"
            >
              <AlertCircle class="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{{ error }}</AlertDescription>
            </Alert>
          </div>

          <!-- Right Column: Graph -->
          <div class="h-full">
            <div v-if="predictionData" class="h-full">
              <h2 class="text-xl font-semibold mb-6">
                Prediction Results for {{ formInputs.symbol }}
              </h2>

              <!-- Chart Container -->
              <Card class="h-[calc(100%-4rem)]">
                <CardContent class="p-0 h-full">
                  <div 
                    ref="plotlyContainer" 
                    class="w-full h-full rounded-lg"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </CardContent>
      
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Loader2, AlertCircle } from 'lucide-vue-next'

// Fixed component imports
import UiCard from '@/components/ui/card/Card.vue'
import UiCardHeader from '@/components/ui/card/CardHeader.vue'
import UiCardTitle from '@/components/ui/card/CardTitle.vue'
import UiCardContent from '@/components/ui/card/CardContent.vue'

import UiSelect from '@/components/ui/select/Select.vue'
import UiSelectContent from '@/components/ui/select/SelectContent.vue'
import UiSelectItem from '@/components/ui/select/SelectItem.vue'
import UiSelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import UiSelectValue from '@/components/ui/select/SelectValue.vue'

import UiButton from '@/components/ui/button/Button.vue'
import UiInput from '@/components/ui/input/Input.vue'
import UiLabel from '@/components/ui/label/Label.vue'

import UiAlert from '@/components/ui/alert/Alert.vue'
import UiAlertTitle from '@/components/ui/alert/AlertTitle.vue'
import UiAlertDescription from '@/components/ui/alert/AlertDescription.vue'

import UiBadge from '@/components/ui/badge/Badge.vue'

// Rename components for template usage
const Card = UiCard
const CardHeader = UiCardHeader
const CardTitle = UiCardTitle
const CardContent = UiCardContent
const Select = UiSelect
const SelectContent = UiSelectContent
const SelectItem = UiSelectItem
const SelectTrigger = UiSelectTrigger
const SelectValue = UiSelectValue
const Button = UiButton
const Input = UiInput
const Label = UiLabel
const Alert = UiAlert
const AlertTitle = UiAlertTitle
const AlertDescription = UiAlertDescription
const Badge = UiBadge

// Available tickers
const availableTickers = ['META', 'AAPL', 'GOOG', 'MSFT', 'NVDA']

interface FormInputs {
  symbol: string
  lookbackYears: string
  forecastDays: number
}

interface StockData {
  ticker: string
  predicted_prices: number[][]
  forecast_days: number
  graph: string
}

interface MarketStatus {
  state: string
  next_open: string | null
  last_close: string | null
  is_regular_session: boolean
}

interface LiveData {
  symbol: string
  company_name: string
  current_price: number
  regular_market_price: number
  previous_close: number
  price_change: number
  price_change_percent: number
  volume: number
  market_cap: number
  pe_ratio: number | null
  fifty_two_week_high: number
  fifty_two_week_low: number
  market_status: MarketStatus
}

const formInputs = ref<FormInputs>({
  symbol: 'AAPL',
  lookbackYears: '1',
  forecastDays: 30
})

const isLoading = ref(false)
const error = ref<string | null>(null)
const predictionData = ref<StockData | null>(null)
const plotlyContainer = ref<HTMLElement | null>(null)

const formatNextOpen = (nextOpen: string) => {
  const date = new Date(nextOpen)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.log(`Failed to load image for ${formInputs.value.symbol}`);
  img.src = '/placeholder.svg';
}

// Add live data ref
const liveData = ref<LiveData | null>(null)

// Add function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

// Add function to fetch live data
const fetchLiveData = async (symbol: string) => {
  try {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.apiBaseUrl}/live/${symbol}`)
    if (!response.ok) throw new Error('Failed to fetch live data')
    const result = await response.json()
    liveData.value = result.data
  } catch (err) {
    console.error('Error fetching live data:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch live data'
  }
}

// Handle ticker change
const handleTickerChange = async (newValue: string) => {
  try {
    await fetchLiveData(newValue)
    if (predictionData.value) {
      await generatePrediction()
    }
  } catch (err) {
    console.error('Error handling ticker change:', err)
  }
}

// Handle form changes for other inputs
const handleFormChange = async () => {
  if (predictionData.value) {
    await generatePrediction()
  }
}

// Load Plotly script
const loadPlotly = async (): Promise<void> => {
  if (window.Plotly) return

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Plotly script'))
    document.head.appendChild(script)
  })
}

// Render chart function
const renderChart = async () => {
  if (!predictionData.value?.graph || !plotlyContainer.value) return

  try {
    const graphHtml = predictionData.value.graph
    const parser = new DOMParser()
    const doc = parser.parseFromString(graphHtml, 'text/html')
    const plotlyDiv = doc.querySelector('.plotly-graph-div')

    if (!plotlyDiv) {
      throw new Error('Graph content not found')
    }

    plotlyContainer.value.innerHTML = plotlyDiv.outerHTML

    // Execute scripts
    doc.querySelectorAll('script').forEach(script => {
      const newScript = document.createElement('script')
      Array.from(script.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value)
      })
      newScript.textContent = script.textContent
      document.body.appendChild(newScript)
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to render chart'
  }
}

// Form submission
const generatePrediction = async () => {
  try {
    isLoading.value = true
    error.value = null

    const config = useRuntimeConfig()
    const response = await fetch(
      `${config.public.apiBaseUrl}/predict?symbol=${formInputs.value.symbol}&lookback_years=${formInputs.value.lookbackYears}&forecast_days=${formInputs.value.forecastDays}`,
      {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch prediction data')
    }

    predictionData.value = await response.json()
    await nextTick()
    await renderChart()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}

// Reset form
const resetForm = () => {
  formInputs.value = {
    symbol: 'AAPL',
    lookbackYears: '1',
    forecastDays: 30
  }
  predictionData.value = null
  error.value = null
}

let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await loadPlotly()
  await fetchLiveData(formInputs.value.symbol)
  await generatePrediction()
  
  // Set up refresh interval when market is open
  refreshInterval = setInterval(() => {
    if (liveData.value?.market_status.state === 'OPEN') {
      fetchLiveData(formInputs.value.symbol)
    }
  }, 10000) // Refresh every 10 seconds when market is open
})

onBeforeUnmount(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<script lang="ts">
declare global {
  interface Window {
    Plotly: any
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>