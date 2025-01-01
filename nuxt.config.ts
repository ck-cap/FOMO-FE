export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    public: {
      apiBaseUrl: "http://localhost:8000/api/v1"
    }
  },

  app: {
    head: {
      title: 'Stock Price Predictor',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  compatibilityDate: '2024-12-20'
})