import { Paperclip, ListChecks } from "lucide-react"
import { Badge } from "../ui/Primitives"

const priorityTone = { critical: "critical", high: "warning", medium: "accent", low: "gray" }

const getCountdown = (dueDate) => {
    if (!dueDate) return null

    const diffMs = new Date(dueDate).setHours(23, 59, 59, 999) - Date.now()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffMs < 0) return { label: `${Math.abs(diffDays)}d overdue`, tone: "critical" }
    if (diffDays === 0) return { label: "Due today", tone: "warning" }
    if (diffDays === 1) return { label: "Due tomorrow", tone: "warning" }
    if (diffDays <= 3) return { label: `${diffDays}d left`, tone: "warning" }
    return { label: `${diffDays}d left`, tone: "gray" }
}

// A single task row for the list view (replaces the old kanban card).
const TaskRow = ({ task, onClick, onStatusChange, statusOptions }) => {
    const countdown = getCountdown(task.dueDate)
    const doneCount = task.subtasks?.filter((subtask) => subtask.status === "Done").length || 0
    const countdownColor = { critical: "text-critical bg-critical/15", warning: "text-warning bg-warning/15", gray: "text-ink-muted bg-white/5" }

    return (
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 transition hover:bg-white/[0.03] last:border-b-0">
            <button onClick={() => onClick(task)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-medium text-ink">{task.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-faint">
                    {task.subtasks?.length > 0 && (
                        <span className="flex items-center gap-1">
                            <ListChecks size={11} />
                            {doneCount}/{task.subtasks.length}
                        </span>
                    )}
                    {task.attachments?.length > 0 && (
                        <span className="flex items-center gap-1">
                            <Paperclip size={11} />
                            {task.attachments.length}
                        </span>
                    )}
                </div>
            </button>

            <Badge tone={priorityTone[task.priority] || "gray"}>{task.priority}</Badge>

            {countdown && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${countdownColor[countdown.tone]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {countdown.label}
                </span>
            )}

            {task.assignTo && (
                <img
                    src={task.assignTo.profileImage}
                    alt={task.assignTo.username}
                    title={task.assignTo.username}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-border-strong"
                />
            )}

            <select
                value={task.status}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => onStatusChange(task, event.target.value)}
                className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-ink outline-none focus:border-accent-500"
            >
                {statusOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>
    )
}

export default TaskRow
