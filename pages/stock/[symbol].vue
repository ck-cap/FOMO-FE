<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-4">Stock Details: {{ symbol }}</h1>
      
      <div v-if="loading" class="flex justify-center">
        <LoadingSpinner />
      </div>
      
      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>
      
      <div v-else-if="stockData" class="bg-white rounded-lg shadow p-6">
        <StockPriceChart :stockData="stockData" />
      </div>
      
      <div class="mt-4">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">
          Back to Search
        </NuxtLink>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { StockData } from '~/types/stock'
  import { fetchStockData } from '~/services/api'
  
  const route = useRoute()
  const symbol = computed(() => route.params.symbol as string)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const stockData = ref<StockData | null>(null)
  
  onMounted(async () => {
    try {
      stockData.value = await fetchStockData(symbol.value)
    } catch (err) {
      error.value = 'Failed to fetch stock data'
    } finally {
      loading.value = false
    }
  })
  </script>