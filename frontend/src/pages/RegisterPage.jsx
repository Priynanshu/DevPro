import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { LayoutGrid, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { registerUser } from "../features/auth/authSlice"
import { Button } from "../components/ui/Primitives"

const RegisterPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { status } = useSelector((state) => state.auth)
    const [form, setForm] = useState({ username: "", email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        const result = await dispatch(registerUser(form))

        if (registerUser.fulfilled.match(result)) {
            toast.success("Account created successfully!")
            navigate("/dashboard")
        } else {
            toast.error(result.payload || "Registration Failed")
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
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
                    <h1 className="mt-4 font-display text-2xl font-bold text-ink">Create Your Account</h1>
                    <p className="mt-1 text-sm text-ink-muted">Start organizing your projects today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">Username</label>
                        <div className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2.5 transition focus-within:ring-1 focus-within:ring-accent-500">
                            <User size={16} className="text-ink-faint" />
                            <input
                                type="text"
                                name="username"
                                required
                                value={form.username}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full bg-transparent text-sm text-ink outline-none"
                            />
                        </div>
                    </div>

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
                        <label className="mb-1 block font-mono text-[11px] font-medium uppercase tracking-wider text-ink-muted">Password</label>
                        <div className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2.5 transition focus-within:ring-1 focus-within:ring-accent-500">
                            <Lock size={16} className="text-ink-faint" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                minLength={6}
                                value={form.password}
                                onChange={handleChange}
                                placeholder="At least 6 characters"
                                className="w-full bg-transparent text-sm text-ink outline-none"
                            />
                            <button type="button" onClick={() => setShowPassword((show) => !show)} className="text-ink-faint hover:text-ink">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" disabled={status === "loading"} className="w-full">
                        {status === "loading" ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>

                <a
                    href={`${import.meta.env.BACKEND_API_BASE_URL || "http://localhost:3000/api"}/auth/google`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-surface-high py-2.5 text-sm font-semibold text-ink transition hover:bg-white/10"
                >
                    Continue With Google
                    <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">SSO</span>
                </a>

                <p className="mt-6 text-center text-sm text-ink-muted">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-accent-400">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    )
}

export default RegisterPage
