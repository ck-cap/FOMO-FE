<!-- components/DockedLayout.vue -->
<template>
    <div class="relative min-h-screen w-full">
      <!-- Main Content Area -->
      <div :class="[
        'transition-all duration-300 ease-in-out',
        isWidgetMaximized ? 'mr-[40%]' : 'w-full'
      ]">
        <slot />
      </div>
  
      <!-- Fixed Chat Container -->
      <div 
        v-if="isWidgetMaximized" 
        class="fixed top-0 right-0 bottom-0 w-[40%] bg-white border-l border-gray-200 shadow-lg overflow-hidden"
      >
        <slot name="widget" />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    isWidgetMaximized: boolean
  }>()
  </script>