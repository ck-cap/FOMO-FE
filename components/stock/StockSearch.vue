<template>
    <div class="p-4">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Stock Symbol</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              v-model="symbol"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter stock symbol (e.g., AAPL)"
            />
            <button
              type="submit"
              class="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  const symbol = ref('')
  const emit = defineEmits(['search'])
  
  const handleSubmit = () => {
    if (symbol.value) {
      emit('search', symbol.value.toUpperCase())
    }
  }
  </script>