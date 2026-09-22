import axios from "axios"

const TOKEN_KEY = "taskflow_token"

// Split-domain deployments (frontend on Vercel, backend on Render) can't
// reliably rely on cross-site cookies anymore — Chrome, Brave, and Safari
// all increasingly block third-party cookies by default. So we keep the
// JWT in localStorage and send it as a normal Authorization header
// instead, which works regardless of any browser's cookie policy.
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token)
    }
}

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY)

export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY)

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "Something Went Wrong"
        return Promise.reject({ ...error, message })
    }
)

export default api