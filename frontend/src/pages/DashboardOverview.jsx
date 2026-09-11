import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FolderKanban, CheckCircle2, Clock, ListTodo, Network, RefreshCcw } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { fetchProjects } from "../features/project/projectSlice"
import { Card, Skeleton, EmptyState, Badge } from "../components/ui/Primitives"
import Sparkline from "../components/ui/Sparkline"
import ProjectNetworkGraph from "../components/project/ProjectNetworkGraph"
import ProjectIcon from "../components/project/ProjectIcon"

const COLORS = ["#FF4D00", "#06B6D4", "#10B981"]
const LIST_HEIGHT = 220

// Buckets projects by creation week so each stat card can show a small,
// honestly-derived trend line instead of a decorative fake graph.
const useCreationTrend = (projects) => {
    return useMemo(() => {
        if (projects.length === 0) return [0, 0, 0, 0, 0, 0]

        const buckets = new Array(6).fill(0)
        const now = Date.now()
        const weekMs = 7 * 24 * 60 * 60 * 1000

        projects.forEach((project) => {
            const age = now - new Date(project.createdAt).getTime()
            const bucketIndex = 5 - Math.min(5, Math.floor(age / weekMs))
            if (bucketIndex >= 0) buckets[bucketIndex] += 1
        })

        // running total, so the line trends upward as projects accumulate
        let total = 0
        return buckets.map((count) => (total += count))
    }, [projects])
}

const StatCard = ({ icon: Icon, label, value, badge, badgeTone, caption, trend, sparkColor }) => (
    <Card className="hover:border-border-strong">
        <div className="flex items-center justify-between text-ink-muted">
            <div className="flex items-center gap-1.5">
                <Icon size={14} className="text-accent-400" />
                <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>
            </div>
            {badge && <Badge tone={badgeTone}>{badge}</Badge>}
        </div>
        <div className="mt-3 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold tracking-tight text-ink">{value}</span>
            <Sparkline data={trend} color={sparkColor} />
        </div>
        {caption && <p className="mt-2 font-mono text-[11px] text-ink-faint">{caption}</p>}
    </Card>
)

const DashboardOverview = () => {
    const dispatch = useDispatch()
    const { list: projects, status } = useSelector((state) => state.project)
    const { user } = useSelector((state) => state.auth)
    const trend = useCreationTrend(projects)

    useEffect(() => {
        dispatch(fetchProjects())
    }, [dispatch])

    const statusData = useMemo(() => {
        const counts = { Active: 0, "On Hold": 0, Completed: 0 }
        projects.forEach((project) => {
            counts[project.status] = (counts[project.status] || 0) + 1
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [projects])

    const activeCount = projects.filter((project) => project.status === "Active").length
    const onHoldCount = projects.filter((project) => project.status === "On Hold").length
    const completedCount = projects.filter((project) => project.status === "Completed").length

    // Honest week-over-week change, derived from the same trend data the
    // stat cards use — not a made-up number.
    const weekOverWeekChange = useMemo(() => {
        const last = trend[trend.length - 1]
        const previous = trend[trend.length - 2]
        if (!previous) return null
        return Math.round(((last - previous) / previous) * 100 * 10) / 10
    }, [trend])

    return (
        <div className="space-y-6">
            {/* Ambient glow backdrop */}
            <div className="relative">
                <div className="pointer-events-none absolute -top-6 left-1/4 h-72 w-72 rounded-full bg-accent-500/10 blur-[120px]" />
                <div className="pointer-events-none absolute right-10 top-24 h-64 w-64 rounded-full bg-info/10 blur-[100px]" />

                <div className="relative flex flex-col justify-between gap-4 border-b border-border pb-6 xl:flex-row xl:items-end">
                    <div className="flex flex-col gap-2">
                        <span className="inline-flex w-fit items-center gap-1.5 rounded bg-surface-high px-2 py-1 font-mono text-[11px] text-accent-300">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
                            SESSION ACTIVE
                        </span>
                        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                            Welcome back, {user?.username?.split(" ")[0]}.
                        </h1>
                        <p className="text-sm text-ink-muted">
                            <span className="font-semibold text-accent-300">{activeCount} active projects</span> across your workspace right now.
                        </p>
                    </div>

                    <button
                        onClick={() => dispatch(fetchProjects())}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-border bg-surface text-ink-muted transition hover:bg-surface-high hover:text-ink"
                        title="Refresh"
                    >
                        <RefreshCcw size={16} />
                    </button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    icon={FolderKanban}
                    label="Total Projects"
                    value={projects.length}
                    badge={projects.length > 0 ? "TRACKED" : null}
                    badgeTone="accent"
                    caption={`${activeCount} currently active`}
                    trend={trend}
                    sparkColor="#FF4D00"
                />
                <StatCard
                    icon={CheckCircle2}
                    label="Active"
                    value={activeCount}
                    badge={activeCount > 0 ? "LIVE" : null}
                    badgeTone="success"
                    caption="In progress right now"
                    trend={trend}
                    sparkColor="#10B981"
                />
                <StatCard
                    icon={Clock}
                    label="On Hold"
                    value={onHoldCount}
                    badge={onHoldCount > 0 ? "PAUSED" : null}
                    badgeTone="warning"
                    caption="Waiting on a decision"
                    trend={trend}
                    sparkColor="#F59E0B"
                />
                <StatCard
                    icon={ListTodo}
                    label="Completed"
                    value={completedCount}
                    badge={completedCount > 0 ? "SHIPPED" : null}
                    badgeTone="info"
                    caption="Wrapped up projects"
                    trend={trend}
                    sparkColor="#06B6D4"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-2 flex flex-col">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <p className="font-mono text-[11px] uppercase tracking-wider text-accent-400">Telemetry</p>
                            <h3 className="font-display text-base font-semibold text-ink">Project Status Distribution</h3>
                        </div>
                        <button
                            onClick={() => dispatch(fetchProjects())}
                            className="mt-0.5 text-ink-faint transition hover:text-ink"
                            title="Refresh"
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>

                    {status === "loading" ? (
                        <Skeleton className="h-56 w-full" />
                    ) : projects.length === 0 ? (
                        <p className="py-16 text-center text-sm text-ink-faint">No project data yet</p>
                    ) : (
                        <div className="flex flex-1 flex-col">
                            <div className="relative" style={{ height: LIST_HEIGHT * 0.72 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={72} outerRadius={84} paddingAngle={4} stroke="none">
                                            {statusData.map((entry, index) => (
                                                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Total Units</span>
                                    <span className="font-display text-3xl font-bold text-ink">{projects.length}</span>
                                    {weekOverWeekChange !== null && (
                                        <span className={`font-mono text-[11px] font-semibold ${weekOverWeekChange >= 0 ? "text-success" : "text-critical"}`}>
                                            {weekOverWeekChange >= 0 ? "STABLE +" : ""}{weekOverWeekChange}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-4">
                                {statusData.map((entry, index) => {
                                    const percent = projects.length > 0 ? Math.round((entry.value / projects.length) * 100) : 0
                                    return (
                                        <div key={entry.name} className="flex flex-col items-center">
                                            <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                {entry.name}
                                            </span>
                                            <span className="font-display text-sm font-bold text-ink">{percent}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </Card>

                <Card className="lg:col-span-3">
                    <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-ink-muted">Recent Projects</h3>
                    {status === "loading" ? (
                        <Skeleton className="w-full" style={{ height: LIST_HEIGHT }} />
                    ) : projects.length === 0 ? (
                        <p className="py-16 text-center text-sm text-ink-faint">No project data yet</p>
                    ) : (
                        <div className="space-y-2 overflow-y-auto pr-1" style={{ height: LIST_HEIGHT }}>
                            {projects.map((project) => (
                                <Link
                                    key={project._id}
                                    to={`/dashboard/projects/${project._id}`}
                                    className="flex items-center gap-3 rounded border border-border px-4 py-3 transition hover:border-border-strong hover:bg-white/5"
                                >
                                    <ProjectIcon icon={project.projectIcon} name={project.projectName} size={28} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-ink">{project.projectName}</p>
                                        <p className="font-mono text-xs text-ink-faint">{project.projectKey}</p>
                                    </div>
                                    <Badge tone="accent">{project.status}</Badge>
                                </Link>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card>
                    <h3 className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink-muted">
                        <Network size={14} />
                        Project Network
                    </h3>
                    {status === "loading" ? (
                        <Skeleton className="h-64 w-full" />
                    ) : projects.length === 0 ? (
                        <EmptyState icon={Network} title="No Projects Yet" description="Once you create a project and add members, their connections will show up here." />
                    ) : (
                        <ProjectNetworkGraph projects={projects} />
                    )}
                </Card>
            </motion.div>
        </div>
    )
}

export default DashboardOverview