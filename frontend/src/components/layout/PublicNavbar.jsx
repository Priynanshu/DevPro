import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { LayoutGrid, LogOut } from "lucide-react"
import { logoutUser } from "../../features/auth/authSlice"

const PublicNavbar = () => {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await dispatch(logoutUser())
        navigate("/")
    }

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-canvas/80 backdrop-blur-xl">
            <nav className="mx-auto grid max-w-7xl grid-cols-2 items-center px-6 py-4 md:grid-cols-3">
                <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-500 text-white">
                        <LayoutGrid size={18} />
                    </span>
                    DevPro
                </Link>

                <div className="hidden items-center justify-center gap-8 text-sm font-medium text-ink-muted md:flex">
                    <Link to="/" className="transition hover:text-ink">Home</Link>
                    <Link to="/about" className="transition hover:text-ink">About</Link>
                    {user && <Link to="/dashboard" className="transition hover:text-ink">Dashboard</Link>}
                </div>

                <div className="flex items-center justify-end gap-3">
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 rounded-md bg-surface-high px-4 py-2 text-sm font-semibold text-ink transition hover:bg-white/10"
                        >
                            <LogOut size={15} />
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-ink-muted transition hover:text-ink">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default PublicNavbar
