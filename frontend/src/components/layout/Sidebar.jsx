import { NavLink, useLocation, matchPath } from "react-router-dom"
import { useSelector } from "react-redux"
import { LayoutDashboard, FolderOpen, ListTodo, Users, Bell, LayoutGrid, ChevronsUpDown, Settings, Home } from "lucide-react"

const navItems = [
    { to: "/", label: "Home", icon: Home, end: true },
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/dashboard/projects", label: "Projects", icon: FolderOpen },
    { to: "/dashboard/my-tasks", label: "My Tasks", icon: ListTodo },
    { to: "/dashboard/notifications", label: "Notifications", icon: Bell }
]

const Sidebar = () => {
    const location = useLocation()
    const { user } = useSelector((state) => state.auth)
    const { unreadCount } = useSelector((state) => state.notification)
    const projectMatch = matchPath("/dashboard/projects/:id/*", location.pathname)
    const currentProjectId = projectMatch?.params?.id

    const linkClass = ({ isActive }) =>
        `flex items-center justify-between px-3 py-2.5 text-sm transition-all rounded ${
            isActive
                ? "bg-accent-500 text-white font-semibold"
                : "text-ink-muted hover:bg-surface-high hover:text-ink"
        }`

    return (
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-canvas md:flex">
            <div className="flex flex-col">
                <div className="flex h-16 items-center gap-2 border-b border-border/70 px-4">
                    <NavLink to="/" className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-accent-500 text-white">
                            <LayoutGrid size={16} />
                        </span>
                        <span className="font-display text-base font-semibold tracking-tight text-ink">DevPro</span>
                    </NavLink>
                    <span className="ml-auto rounded bg-accent-500/20 px-1.5 py-0.5 font-mono text-[10px] text-accent-300">v1.0</span>
                </div>

                <div className="p-3">
                    <div className="flex items-center justify-between px-1 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-faint">
                        Workspace
                    </div>
                    <div className="mt-1 flex cursor-pointer items-center justify-between rounded border border-border bg-surface p-2 transition-colors hover:border-border-strong">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent-500 font-mono text-[10px] font-bold text-white">
                                {user?.username?.[0]?.toUpperCase() || "T"}
                            </div>
                            <span className="truncate text-sm text-ink">{user?.username ? `${user.username}'s Workspace` : "Workspace"}</span>
                        </div>
                        <ChevronsUpDown size={14} className="shrink-0 text-ink-faint" />
                    </div>
                </div>

                <nav className="flex flex-col gap-1 px-3">
                    {navItems.map(({ to, label, icon: Icon, end }) => (
                        <NavLink key={to} to={to} end={end} className={linkClass}>
                            <div className="flex items-center gap-3">
                                <Icon size={17} />
                                <span>{label}</span>
                            </div>
                            {to === "/dashboard/notifications" && unreadCount > 0 && (
                                <span className="rounded bg-accent-500 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </NavLink>
                    ))}

                    {currentProjectId ? (
                        <NavLink to={`/dashboard/projects/${currentProjectId}/team`} className={linkClass}>
                            <div className="flex items-center gap-3">
                                <Users size={17} />
                                <span>Team</span>
                            </div>
                        </NavLink>
                    ) : (
                        <div
                            title="Open a project first to see its team"
                            className="flex cursor-not-allowed items-center gap-3 rounded px-3 py-2.5 text-sm text-ink-faint"
                        >
                            <Users size={17} />
                            Team
                        </div>
                    )}
                </nav>
            </div>

            <div className="flex items-center justify-between border-t border-border/70 bg-canvas p-3">
                <NavLink to="/dashboard/profile" className="flex items-center gap-2 overflow-hidden">
                    <img
                        src={user?.profileImage}
                        alt={user?.username}
                        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-accent-500/30"
                    />
                    <div className="flex flex-col truncate">
                        <span className="truncate text-sm font-semibold text-ink">{user?.username}</span>
                        <span className="truncate font-mono text-[11px] capitalize text-ink-faint">{user?.role}</span>
                    </div>
                </NavLink>
                <NavLink to="/dashboard/profile" className="p-1 text-ink-faint transition-colors hover:text-ink">
                    <Settings size={16} />
                </NavLink>
            </div>
        </aside>
    )
}

export default Sidebar
