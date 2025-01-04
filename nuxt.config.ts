// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  components: {
    dirs: [
      {
        path: '~/components',
        extensions: ['.vue'],
      }
    ]
  },

  app: {
    head: {
      title: 'Stock Price Predictor',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          hid: 'description', 
          name: 'description', 
          content: 'Stock price prediction visualization tool' 
        }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
    }
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false
  },

  experimental: {
    payloadExtraction: false,
  },

  nitro: {
    preset: 'node'
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-01-05'
})