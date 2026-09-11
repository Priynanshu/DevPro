import { NavLink, useLocation, matchPath } from "react-router-dom"
import { useSelector } from "react-redux"
import { Home, FolderOpen, ListTodo, Bell, Users } from "lucide-react"

const MobileNav = () => {
    const location = useLocation()
    const { unreadCount } = useSelector((state) => state.notification)
    const projectMatch = matchPath("/dashboard/projects/:id/*", location.pathname)
    const currentProjectId = projectMatch?.params?.id

    const navItems = [
        { to: "/dashboard", label: "Overview", icon: Home, end: true },
        { to: "/dashboard/projects", label: "Projects", icon: FolderOpen },
        { to: "/dashboard/my-tasks", label: "Tasks", icon: ListTodo },
        { to: "/dashboard/notifications", label: "Alerts", icon: Bell, badge: unreadCount },
        currentProjectId
            ? { to: `/dashboard/projects/${currentProjectId}/team`, label: "Team", icon: Users }
            : { to: "/dashboard/profile", label: "Profile", icon: Users }
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-canvas/95 py-2 backdrop-blur-xl md:hidden">
            {navItems.map(({ to, label, icon: Icon, end, badge }) => (
                <NavLink
                    key={label}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                        `relative flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition ${
                            isActive ? "text-accent-400" : "text-ink-faint"
                        }`
                    }
                >
                    <Icon size={20} />
                    {label}
                    {badge > 0 && (
                        <span className="absolute right-1 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-accent-500 text-[9px] font-bold text-white">
                            {badge > 9 ? "9+" : badge}
                        </span>
                    )}
                </NavLink>
            ))}
        </nav>
    )
}

export default MobileNav
