import type { StockData } from '~/types/stock'

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  const config = useRuntimeConfig()
  
  try {
    const config = useRuntimeConfig()
    console.log('API Base URL:', config.public.apiBaseUrl)

    const response = await fetch(`${config.public.apiBaseUrl}/stock/${symbol}`)
    if (!response.ok) throw new Error('Failed to fetch stock data')
    return await response.json()
  } catch (error) {
    console.error('Error fetching stock data:', error)
    throw error
  }
}