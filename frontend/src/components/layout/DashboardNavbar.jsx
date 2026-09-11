import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Bell, LogOut, Search } from "lucide-react"
import { logoutUser } from "../../features/auth/authSlice"
import { fetchNotifications } from "../../features/notification/notificationSlice"
import ImageLightbox from "../ui/ImageLightbox"

const pageTitles = {
    "/dashboard": "Overview",
    "/dashboard/projects": "Projects",
    "/dashboard/my-tasks": "My Tasks",
    "/dashboard/notifications": "Notifications",
    "/dashboard/profile": "Profile"
}

const DashboardNavbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector((state) => state.auth)
    const { unreadCount } = useSelector((state) => state.notification)
    const [menuOpen, setMenuOpen] = useState(false)
    const [dpOpen, setDpOpen] = useState(false)

    useEffect(() => {
        dispatch(fetchNotifications())
    }, [dispatch])

    const handleLogout = async () => {
        await dispatch(logoutUser())
        navigate("/login")
    }

    const currentTitle = pageTitles[location.pathname] || "DevPro"

    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-canvas/90 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-mono text-sm text-ink-muted">
                <Link to="/" className="cursor-pointer hover:text-ink" title="Back to Home">DevPro</Link>
                <span className="hidden text-ink-faint sm:inline">/</span>
                <span className="hidden font-semibold text-ink sm:inline">{currentTitle}</span>
            </div>

            <div className="flex items-center gap-3">

                <button
                    onClick={() => navigate("/dashboard/notifications")}
                    className="relative rounded p-2 text-ink-muted transition hover:bg-white/5 hover:text-ink"
                >
                    <Bell size={19} />
                    {unreadCount > 0 && (
                        <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 font-mono text-[9px] font-bold text-white">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </button>

                <div className="h-4 w-px bg-border" />

                <div className="relative">
                    <button
                        onClick={() => setMenuOpen((open) => !open)}
                        className="flex items-center gap-2 rounded px-2 py-1.5 transition hover:bg-white/5"
                    >
                        <img
                            src={user?.profileImage}
                            alt={user?.username}
                            onClick={(event) => { event.stopPropagation(); setDpOpen(true) }}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-accent-500/30"
                        />
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-44 rounded border border-border bg-surface py-1 shadow-lg">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-muted hover:bg-white/5 hover:text-ink"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </header>
    )
}

export default DashboardNavbar
