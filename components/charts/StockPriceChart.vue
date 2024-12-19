<template>
    <div class="w-full h-[400px]">
      <Line
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
      />
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
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  )
  
  const props = defineProps<{
    stockData: {
      dates: string[]
      prices: number[]
    }
  }>()
  
  const chartData = computed(() => ({
    labels: props.stockData.dates,
    datasets: [
      {
        label: 'Stock Price',
        data: props.stockData.prices,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }))
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  }
  </script>