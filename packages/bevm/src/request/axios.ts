import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

interface Response<T = any> {
  data: T
  code: number
  msg?: string
}

export class ResponseError<T = any> extends Error {
  message: string
  data: T | undefined
  code: number | undefined

  constructor (message?: string, code?: number, data?: T) {
    message = message ?? 'Network error, please try again later'
    super(message)
    this.name = 'ResponseError'

    this.message = message
    this.data = data
    this.code = code
  }
}

interface Instance extends AxiosInstance {
  <T>(config: AxiosRequestConfig): Promise<T>
  <T>(url: string, config?: AxiosRequestConfig): Promise<T>
  request: <T>(config: AxiosRequestConfig) => Promise<T>
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
  head: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>
}

const instance: Instance = axios.create({
  baseURL: import.meta.env.VITE_REQUEST_DOMAIN,
  withCredentials: true
})

instance.interceptors.request.use((config) => {
  return config
})

instance.interceptors.response.use(async (res) => {
  const { data: { data, code, msg } } = res as AxiosResponse<Response>
  const isInternalError = code !== 10000
  if (isInternalError) {
    throw new ResponseError(msg, code, data)
  } else {
    return data
  }
})

export default instance
