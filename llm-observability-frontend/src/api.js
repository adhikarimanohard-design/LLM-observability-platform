import axios from 'axios'

const API_BASE_URL = 'https://llm-observability-platform-7.onrender.com'

const api = axios.create({ baseURL: API_BASE_URL })

export const getMetrics = (hours = 24) =>
  api.get('/api/metrics', { params: { hours } }).then((r) => r.data)

export const getPrompts = () => api.get('/api/prompts').then((r) => r.data)

export const createPrompt = (payload) =>
  api.post('/api/prompts', payload).then((r) => r.data)

export const deletePrompt = (id) => 
  api.delete(`/api/prompts/${id}`).then((r) => r.data)

export const runComplete = (payload) =>
  api.post('/api/complete', payload).then((r) => r.data)

export const runEval = (payload) =>
  api.post('/api/eval/run', payload).then((r) => r.data)

export const getHealth = () => api.get('/health').then((r) => r.data)

export default api
