// plugins/chart.client.ts
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
  import zoomPlugin from 'chartjs-plugin-zoom'
  
  export default defineNuxtPlugin(() => {
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Title,
      Tooltip,
      Legend,
      zoomPlugin
    )
  })