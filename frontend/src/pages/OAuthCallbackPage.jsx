import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { fetchCurrentUser } from "../features/auth/authSlice"
import api, { setAuthToken } from "../api/axios"

// Google login lands here first with a short-lived token in the URL.
// We immediately trade it for a real httpOnly cookie via a normal XHR
// call — the same mechanism email/password login already uses — then
// move on to the dashboard.
const OAuthCallbackPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [error, setError] = useState(false)

    useEffect(() => {
        const finalize = async () => {
            const token = searchParams.get("token")

            if (!token) {
                setError(true)
                setTimeout(() => navigate("/login?error=auth_failed"), 1500)
                return
            }

            try {
                const { data } = await api.post("/auth/google/finalize", { token })
                setAuthToken(data.token)
                await dispatch(fetchCurrentUser())
                navigate("/dashboard", { replace: true })
            } catch (err) {
                setError(true)
                setTimeout(() => navigate("/login?error=auth_failed"), 1500)
            }
        }

        finalize()
    }, [])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent-500/20 border-t-accent-500" />
            <p className="font-mono text-sm text-ink-muted">
                {error ? "Something went wrong. Redirecting to login..." : "Finishing sign in..."}
            </p>
        </div>
    )
}

export default OAuthCallbackPage