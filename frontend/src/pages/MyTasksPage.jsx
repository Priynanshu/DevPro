import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ListTodo, Users2, AlertTriangle, Clock3, CheckCircle2, Paperclip, ListChecks } from "lucide-react"
import toast from "react-hot-toast"
import { EmptyState, Skeleton } from "../components/ui/Primitives"
import ProjectIcon from "../components/project/ProjectIcon"
import api from "../api/axios"

const priorityStyle = {
    critical: "bg-critical text-white",
    high: "bg-warning/20 text-warning",
    medium: "bg-accent-500/15 text-accent-300",
    low: "bg-white/5 text-ink-muted"
}

const getDueMeta = (dueDate) => {
    if (!dueDate) return null
    const diffMs = new Date(dueDate).setHours(23, 59, 59, 999) - Date.now()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffMs < 0) return { label: `${Math.abs(diffDays)}d overdue`, tone: "text-critical bg-critical/15" }
    if (diffDays === 0) return { label: "Due today", tone: "text-warning bg-warning/15" }
    if (diffDays <= 3) return { label: `${diffDays}d left`, tone: "text-warning bg-warning/15" }
    return { label: `${diffDays}d left`, tone: "text-ink-muted bg-white/5" }
}

const MetricCard = ({ icon: Icon, label, value, tone }) => (
    <div className="flex flex-col justify-between rounded border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">{label}</span>
            <Icon size={14} className={tone} />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`font-display text-2xl font-bold ${tone}`}>{String(value).padStart(2, "0")}</span>
            <span className="font-mono text-xs text-ink-faint">tasks</span>
        </div>
    </div>
)

const TaskListItem = ({ task, onClick }) => {
    const dueMeta = getDueMeta(task.dueDate)
    const doneCount = task.subtasks?.filter((subtask) => subtask.status === "Done").length || 0

    return (
        <div
            onClick={onClick}
            className="grid cursor-pointer grid-cols-12 items-center gap-3 rounded border border-border bg-surface px-4 py-3 transition hover:border-border-strong hover:bg-surface-hover"
        >
            <div className="col-span-12 flex min-w-0 items-center gap-3 md:col-span-5">
                <ProjectIcon icon={task.project?.projectIcon} name={task.project?.projectName} size={22} />
                <span className="truncate text-sm font-medium text-ink">{task.title}</span>
            </div>

            <div className="col-span-6 truncate font-mono text-xs text-ink-faint md:col-span-2">
                {task.project?.projectName}
            </div>

            <div className="col-span-6 md:col-span-2">
                {dueMeta && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${dueMeta.tone}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {dueMeta.label}
                    </span>
                )}
            </div>

            <div className="col-span-6 flex items-center gap-2 md:col-span-2">
                <span className={`rounded px-2 py-1 font-mono text-[10px] font-bold uppercase ${priorityStyle[task.priority]}`}>
                    {task.priority}
                </span>
                {task.subtasks?.length > 0 && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                        <ListChecks size={11} />
                        {doneCount}/{task.subtasks.length}
                    </span>
                )}
            </div>

            <div className="col-span-6 flex items-center justify-end gap-2 md:col-span-1">
                {task.attachments?.length > 0 && (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-ink-faint">
                        <Paperclip size={11} />
                        {task.attachments.length}
                    </span>
                )}
            </div>
        </div>
    )
}

const MyTasksPage = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState("assigned-to-me")

    const [myTasks, setMyTasks] = useState([])
    const [loadingMyTasks, setLoadingMyTasks] = useState(true)

    const [assignedByMe, setAssignedByMe] = useState([])
    const [isLeadOfAnyProject, setIsLeadOfAnyProject] = useState(false)
    const [loadingAssignedByMe, setLoadingAssignedByMe] = useState(true)

    useEffect(() => {
        const loadMyTasks = async () => {
            try {
                setLoadingMyTasks(true)
                const { data } = await api.get("/tasks/my-assigned")
                setMyTasks(data.tasks)
            } catch (error) {
                toast.error("Could Not Load Your Tasks")
            } finally {
                setLoadingMyTasks(false)
            }
        }

        const loadAssignedByMe = async () => {
            try {
                setLoadingAssignedByMe(true)
                const { data } = await api.get("/tasks/assigned-by-me")
                setAssignedByMe(data.tasks)
                setIsLeadOfAnyProject(data.isLeadOfAnyProject)
            } catch (error) {
                toast.error("Could Not Load Assigned Tasks")
            } finally {
                setLoadingAssignedByMe(false)
            }
        }

        loadMyTasks()
        loadAssignedByMe()
    }, [])

    const handleOpenTask = (task) => {
        navigate(`/dashboard/projects/${task.project._id}?task=${task._id}`)
    }

    const metrics = useMemo(() => {
        const overdue = myTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "Done").length
        const dueSoon = myTasks.filter((task) => {
            if (!task.dueDate) return false
            const diffDays = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
            return diffDays >= 0 && diffDays <= 3
        }).length
        const completed = myTasks.filter((task) => task.status === "Done").length
        return { overdue, dueSoon, total: myTasks.length, completed }
    }, [myTasks])

    const groupedByAssignee = assignedByMe
        .filter((task) => task.assignTo)
        .reduce((groups, task) => {
            const key = task.assignTo._id
            if (!groups[key]) {
                groups[key] = { assignee: task.assignTo, tasks: [] }
            }
            groups[key].tasks.push(task)
            return groups
        }, {})

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-2xl font-bold text-ink">My Tasks</h1>
                <p className="mt-1 text-sm text-ink-muted">Everything assigned to you, across every project.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MetricCard icon={AlertTriangle} label="Overdue" value={metrics.overdue} tone="text-critical" />
                <MetricCard icon={Clock3} label="Due Soon" value={metrics.dueSoon} tone="text-warning" />
                <MetricCard icon={ListTodo} label="Total Assigned" value={metrics.total} tone="text-accent-300" />
                <MetricCard icon={CheckCircle2} label="Completed" value={metrics.completed} tone="text-success" />
            </div>

            {isLeadOfAnyProject && (
                <div className="flex w-fit gap-1 rounded bg-surface p-1">
                    <button
                        onClick={() => setActiveTab("assigned-to-me")}
                        className={`rounded px-4 py-1.5 text-sm font-medium transition ${activeTab === "assigned-to-me" ? "bg-accent-500 text-white" : "text-ink-muted hover:text-ink"}`}
                    >
                        Assigned To Me
                    </button>
                    <button
                        onClick={() => setActiveTab("assigned-by-me")}
                        className={`rounded px-4 py-1.5 text-sm font-medium transition ${activeTab === "assigned-by-me" ? "bg-accent-500 text-white" : "text-ink-muted hover:text-ink"}`}
                    >
                        Assigned By Me
                    </button>
                </div>
            )}

            {activeTab === "assigned-to-me" ? (
                loadingMyTasks ? (
                    <div className="space-y-2">
                        {[...Array(4)].map((_, index) => <Skeleton key={index} className="h-14 w-full" />)}
                    </div>
                ) : myTasks.length === 0 ? (
                    <EmptyState icon={ListTodo} title="No Tasks Assigned To You" description="When a project lead assigns you a task, it will show up here." />
                ) : (
                    <div className="space-y-2">
                        {myTasks.map((task, index) => (
                            <motion.div key={task._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
                                <TaskListItem task={task} onClick={() => handleOpenTask(task)} />
                            </motion.div>
                        ))}
                    </div>
                )
            ) : (
                loadingAssignedByMe ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-24 w-full" />)}
                    </div>
                ) : Object.keys(groupedByAssignee).length === 0 ? (
                    <EmptyState icon={Users2} title="You Haven't Assigned Any Tasks Yet" description="Tasks you assign to teammates across your projects will appear here, grouped by person." />
                ) : (
                    <div className="space-y-5">
                        {Object.values(groupedByAssignee).map((group) => (
                            <div key={group.assignee._id}>
                                <div className="mb-2 flex items-center gap-2.5">
                                    <img src={group.assignee.profileImage} alt={group.assignee.username} className="h-7 w-7 rounded-full object-cover" />
                                    <p className="text-sm font-semibold text-ink">{group.assignee.username}</p>
                                    <span className="font-mono text-xs text-ink-faint">{group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}</span>
                                </div>
                                <div className="space-y-2">
                                    {group.tasks.map((task) => (
                                        <TaskListItem key={task._id} task={task} onClick={() => handleOpenTask(task)} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    )
}

export default MyTasksPage
