import { boot } from 'quasar/wrappers'
import axios from 'axios'

const serverUrl = process.env.PROD
  ? 'http://anastasi-target.ru'
  : 'http://localhost:8080'

const api = axios.create({
  withCredentials: true,
  baseURL: serverUrl,
})

export default boot(({ app }) => {
  api.interceptors.request.use(
    (config) => {
      config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
      return config
    },
    (e) => {
      return Promise.reject(e)
    }
  )

  api.interceptors.response.use(
    (config) => config,
    async (error) => {
      const originalRequest = error.config
      if (
        error.response.status === 401 &&
        error.config &&
        !error.config._isRetry
      ) {
        originalRequest._isRetry = true
        try {
          const response = await axios.get(`${serverUrl}/api/auth/refresh`, {
            withCredentials: true,
          })
          localStorage.setItem('token', response.data.accessToken)
          return api.request(originalRequest)
        } catch (e) {
          console.log(e)
        }
      }
      throw error
    }
  )

  app.config.globalProperties.$serverUrl = serverUrl
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api, serverUrl }
