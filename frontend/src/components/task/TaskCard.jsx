import { motion } from "framer-motion"
import { Paperclip, ListChecks } from "lucide-react"
import { Badge } from "../ui/Primitives"

const priorityTone = { critical: "critical", high: "warning", medium: "accent", low: "gray" }

const getCountdown = (dueDate) => {
    if (!dueDate) return null
    const diffMs = new Date(dueDate).setHours(23, 59, 59, 999) - Date.now()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffMs < 0) return { label: `${Math.abs(diffDays)}d overdue`, tone: "text-critical bg-critical/15" }
    if (diffDays === 0) return { label: "Due today", tone: "text-warning bg-warning/15" }
    if (diffDays === 1) return { label: "Due tomorrow", tone: "text-warning bg-warning/15" }
    if (diffDays <= 3) return { label: `${diffDays}d left`, tone: "text-warning bg-warning/15" }
    return { label: `${diffDays}d left`, tone: "text-ink-muted bg-white/5" }
}

// Draggable kanban card — used inside the board columns.
const TaskCard = ({ task, onClick, onDragStart }) => {
    const countdown = getCountdown(task.dueDate)
    const doneCount = task.subtasks?.filter((subtask) => subtask.status === "Done").length || 0

    return (
        <motion.div
            layout
            draggable
            onDragStart={(event) => onDragStart(event, task)}
            onClick={() => onClick(task)}
            whileHover={{ y: -2 }}
            className="cursor-pointer rounded-lg border border-border bg-surface p-3.5 transition hover:border-border-strong"
        >
            <div className="mb-2 flex items-center justify-between">
                <Badge tone={priorityTone[task.priority] || "gray"}>{task.priority}</Badge>
                {countdown && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${countdown.tone}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {countdown.label}
                    </span>
                )}
            </div>

            <p className="text-sm font-medium text-ink">{task.title}</p>
            {task.description && (
                <p className="mt-1 line-clamp-2 text-xs text-ink-muted">{task.description}</p>
            )}

            <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 font-mono text-[11px] text-ink-faint">
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
                {task.assignTo && (
                    <img
                        src={task.assignTo.profileImage}
                        alt={task.assignTo.username}
                        title={task.assignTo.username}
                        className="h-6 w-6 rounded-full object-cover"
                    />
                )}
            </div>
        </motion.div>
    )
}

export default TaskCard
