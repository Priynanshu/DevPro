import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { LayoutGrid, Mail, Lock, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { loginUser } from "../features/auth/authSlice"
import { Button } from "../components/ui/Primitives"

const LoginPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { status } = useSelector((state) => state.auth)
    const [form, setForm] = useState({ email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        const error = searchParams.get("error")
        if (error === "google_not_configured") {
            toast.error("Google Login Is Not Configured Yet")
        } else if (error === "auth_failed") {
            toast.error("Google Login Failed. Please Try Again")
        }
    }, [])

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const result = await dispatch(loginUser(form))

        if (loginUser.fulfilled.match(result)) {
            toast.success("Welcome back!")
            navigate("/dashboard")
        } else {
            toast.error(result.payload || "Login Failed")
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md rounded-xl border border-border bg-surface p-8"
            >
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-500 text-white">
                        <LayoutGrid size={22} />
                    </span>
                    <h1 className="mt-4 font-display text-2xl font-bold text-ink">Welcome Back</h1>
                    <p className="mt-1 text-sm text-ink-muted">Login to continue to DevPro</p>
                </div>

                <a
                    href={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/auth/google`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-high py-2.5 text-sm font-semibold text-ink transition hover:bg-white/10"
                >
                    Continue With Google
                    <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">SSO</span>
                </a>

                <div className="my-5 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Or Continue With Email</span>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">Email</label>
                        <div className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2.5 transition focus-within:ring-1 focus-within:ring-accent-500">
                            <Mail size={16} className="text-ink-faint" />
                            <input
                                type="email"
                                name="email"
                                required
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full bg-transparent text-sm text-ink outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <label className="font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">Password</label>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2.5 transition focus-within:ring-1 focus-within:ring-accent-500">
                            <Lock size={16} className="text-ink-faint" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-transparent text-sm text-ink outline-none"
                            />
                            <button type="button" onClick={() => setShowPassword((show) => !show)} className="text-ink-faint hover:text-ink">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" disabled={status === "loading"} className="w-full">
                        {status === "loading" ? "Logging In..." : "Login"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-ink-muted">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-semibold text-accent-400">
                        Sign up
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

export default LoginPage
