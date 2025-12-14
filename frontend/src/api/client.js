import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://smart-school-bus-api.onrender.com/api/v1'

console.log('API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: Thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor: Xử lý response
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error.response?.status, error.config?.url)
    
    // Nếu lỗi 401 và không phải trang login
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname.includes('/login')
      
      if (!isLoginPage) {
        // Thử refresh token
        const originalRequest = error.config
        if (!originalRequest._retry) {
          originalRequest._retry = true
          
          try {
            const { data } = await axios.post(
              `${API_BASE_URL}/auth/token`,
              {},
              { withCredentials: true }
            )
            
            if (data.accessToken) {
              localStorage.setItem('accessToken', data.accessToken)
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
              return api(originalRequest)
            }
          } catch (refreshError) {
            console.error('Refresh token failed')
          }
        }
        
        // Refresh thất bại → đăng xuất
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        window.location.href = '/admin/login'
      }
    }
    
    return Promise.reject(error)
  }
)

export default api