<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Stock Price Predictor</h1>
      
      <StockSearch @search="handleSearch" />
      
      <div v-if="error" class="text-red-600 mt-4">
        {{ error }}
      </div>
      
      <div v-if="loading" class="flex justify-center mt-8">
        <LoadingSpinner />
      </div>
      
      <div v-if="stockData" class="mt-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-2xl font-semibold mb-4">{{ stockData.symbol }} Price History</h2>
          <StockPriceChart :stockData="stockData" />
          
          <div class="mt-6">
            <NuxtLink
              :to="`/stock/predict?symbol=${stockData.symbol}`"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Generate Price Prediction
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import type { StockData } from '~/types/stock'
  import { fetchStockData } from '~/services/api'
  
  const loading = ref(false)
  const error = ref<string | null>(null)
  const stockData = ref<StockData | null>(null)
  
  const handleSearch = async (symbol: string) => {
    loading.value = true
    error.value = null
    
    try {
      stockData.value = await fetchStockData(symbol)
    } catch (err) {
      error.value = 'Failed to fetch stock data. Please try again.'
    } finally {
      loading.value = false
    }
  }
  </script>