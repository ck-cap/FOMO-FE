import type { StockData } from '~/types/stock'

interface DateRange {
  startDate: string  // Format: 'YYYY-MM-DD'
  endDate: string    // Format: 'YYYY-MM-DD'
}

interface FetchStockOptions extends Partial<DateRange> {
  interval?: '1d' | '1wk' | '1mo'  // Data interval options
}

export const fetchStockData = async (
  symbol: string,
  options?: FetchStockOptions
): Promise<StockData> => {
  const config = useRuntimeConfig()
  
  if (!symbol) {
    throw new Error('Stock symbol is required')
  }

  try {
    // Build query parameters
    const queryParams = new URLSearchParams()
    
    if (options?.startDate) {
      queryParams.append('startDate', options.startDate)
    }
    
    if (options?.endDate) {
      queryParams.append('endDate', options.endDate)
    }
    
    if (options?.interval) {
      queryParams.append('interval', options.interval)
    }

    const queryString = queryParams.toString()
    const url = `${config.public.apiBaseUrl}/stock/${symbol.toUpperCase()}${
      queryString ? `?${queryString}` : ''
    }`

    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to fetch stock data: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    
    if (!isValidStockData(data)) {
      throw new Error('Invalid stock data format received from API')
    }

    return data
  } catch (error) {
    console.error('Error fetching stock data:', error)
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error occurred while fetching stock data')
  }
}

// Type guard function to validate the API response
function isValidStockData(data: unknown): data is StockData {
  return (
    typeof data === 'object' &&
    data !== null &&
    // Add checks for required StockData properties based on your interface
    'symbol' in data &&
    typeof (data as StockData).symbol === 'string' &&
    'prices' in data &&
    Array.isArray((data as StockData).prices)
    // Add other property checks as needed
  )
}

// Helper function to validate date format (YYYY-MM-DD)
export const isValidDateFormat = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}