import axios from 'axios'

const API_URL = 'http://localhost:3000/api'

export const searchApi = {
  // Realizar búsqueda
  search: async (query) => {
    try {
      const response = await axios.post(`${API_URL}/search`, {
        query: query
      })
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Search API error:', error)
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error al conectar con el servidor'
      }
    }
  },

  // Verificar salud del servidor
  /*
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_URL}/health`)
      return response.data
    } catch (error) {
      console.error('Health check error:', error)
      return { status: 'error' }
    }
  }*/
}