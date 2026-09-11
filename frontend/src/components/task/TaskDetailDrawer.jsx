import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Send, Trash2, Paperclip, ListChecks, Plus, FileText, Lock, AlarmClock, CircleDot } from "lucide-react"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { updateTask, deleteTask } from "../../features/task/taskSlice"
import { Badge, Button } from "../ui/Primitives"
import api from "../../api/axios"

const getDueMeta = (dueDate) => {
    if (!dueDate) return null
    const diffMs = new Date(dueDate).setHours(23, 59, 59, 999) - Date.now()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    if (diffMs < 0) return { label: `${Math.abs(diffDays)}D OVERDUE`, tone: "text-critical bg-critical/15" }
    if (diffDays === 0) return { label: "DUE TODAY", tone: "text-warning bg-warning/15" }
    return { label: `${diffDays}D LEFT`, tone: "text-ink-muted bg-white/5" }
}

const TaskDetailDrawer = ({ task, onClose, members = [], columns = [], isLead = true }) => {
    const dispatch = useDispatch()
    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState("")
    const [summary, setSummary] = useState("")
    const [summarizing, setSummarizing] = useState(false)
    const [loadingComments, setLoadingComments] = useState(false)

    const [subtasks, setSubtasks] = useState([])
    const [loadingSubtasks, setLoadingSubtasks] = useState(false)
    const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
    const [addingSubtask, setAddingSubtask] = useState(false)

    const [uploadingFile, setUploadingFile] = useState(false)
    const [attachments, setAttachments] = useState(task?.attachments || [])
    const [removingUrl, setRemovingUrl] = useState(null)

    const statusOptions = columns.length > 0 ? columns.map((column) => column.name) : ["Todo", "In Progress", "Done"]
    const dueMeta = getDueMeta(task?.dueDate)

    useEffect(() => {
        if (!task) return

        const loadComments = async () => {
            try {
                setLoadingComments(true)
                const { data } = await api.get(`/comments/task/${task._id}/all`)
                setComments(data.comments)
            } catch (error) {
                toast.error("Could Not Load Comments")
            } finally {
                setLoadingComments(false)
            }
        }

        const loadSubtasks = async () => {
            try {
                setLoadingSubtasks(true)
                const { data } = await api.get(`/subtasks/task/${task._id}/all`)
                setSubtasks(data.subTasks)
            } catch (error) {
                toast.error("Could Not Load Subtasks")
            } finally {
                setLoadingSubtasks(false)
            }
        }

        loadComments()
        loadSubtasks()
        setSummary("")
        setAttachments(task.attachments || [])
    }, [task])

    if (!task) return null

    const doneCount = subtasks.filter((subtask) => subtask.status === "Done").length
    const subtaskPercent = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0

    const handleStatusChange = async (status) => {
        if (status.trim().toLowerCase() === "done" && subtasks.length > 0) {
            const allSubtasksDone = subtasks.every((subtask) => subtask.status === "Done")
            if (!allSubtasksDone) {
                toast.error("Complete All Subtasks Before Marking This Task As Done")
                return
            }
        }
        const result = await dispatch(updateTask({ id: task._id, payload: { status } }))
        if (updateTask.fulfilled.match(result)) toast.success("Status Updated")
    }

    const handleAssigneeChange = async (assignTo) => {
        await dispatch(updateTask({ id: task._id, payload: { assignTo } }))
        toast.success("Assignee Updated")
    }

    const handleAddComment = async (event) => {
        event.preventDefault()
        if (!commentText.trim()) return
        try {
            const { data } = await api.post(`/comments/task/${task._id}/create`, { text: commentText })
            setComments((prev) => [...prev, data.comment])
            setCommentText("")
        } catch (error) {
            toast.error(error.message || "Could Not Add Comment")
        }
    }

    const handleSummarize = async () => {
        try {
            setSummarizing(true)
            const { data } = await api.get(`/ai/summarize/${task._id}`)
            setSummary(data.summary)
        } catch (error) {
            toast.error(error.message || "Could Not Summarize Task")
        } finally {
            setSummarizing(false)
        }
    }

    const handleDelete = async () => {
        const result = await dispatch(deleteTask(task._id))
        if (deleteTask.fulfilled.match(result)) {
            toast.success("Task Deleted")
            onClose()
        }
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return
        const formData = new FormData()
        formData.append("file", file)
        try {
            setUploadingFile(true)
            const { data } = await api.put(`/tasks/attachment/${task._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            setAttachments(data.task.attachments)
            toast.success("Attachment Uploaded")
        } catch (error) {
            toast.error(error.message || "Could Not Upload Attachment")
        } finally {
            setUploadingFile(false)
            event.target.value = ""
        }
    }

    const handleRemoveAttachment = async (url) => {
        try {
            setRemovingUrl(url)
            const { data } = await api.delete(`/tasks/attachment/${task._id}`, { data: { url } })
            setAttachments(data.task.attachments)
            toast.success("Attachment Removed")
        } catch (error) {
            toast.error(error.message || "Could Not Remove Attachment")
        } finally {
            setRemovingUrl(null)
        }
    }

    const handleAddSubtask = async (event) => {
        event.preventDefault()
        if (!newSubtaskTitle.trim()) return
        try {
            setAddingSubtask(true)
            const { data } = await api.post(`/subtasks/task/${task._id}/create`, { title: newSubtaskTitle.trim() })
            setSubtasks((prev) => [data.subTask, ...prev])
            setNewSubtaskTitle("")
        } catch (error) {
            toast.error(error.message || "Could Not Add Subtask")
        } finally {
            setAddingSubtask(false)
        }
    }

    const handleToggleSubtask = async (subtask, newStatus) => {
        try {
            const { data } = await api.put(`/subtasks/edit/${subtask._id}`, { status: newStatus })
            setSubtasks((prev) => prev.map((item) => item._id === subtask._id ? data.subTask : item))
        } catch (error) {
            toast.error("Could Not Update Subtask")
        }
    }

    const handleDeleteSubtask = async (subtaskId) => {
        try {
            await api.delete(`/subtasks/delete/${subtaskId}`)
            setSubtasks((prev) => prev.filter((item) => item._id !== subtaskId))
        } catch (error) {
            toast.error("Could Not Delete Subtask")
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "tween", duration: 0.25 }}
                    onClick={(event) => event.stopPropagation()}
                    className="flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl"
                >
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-3 backdrop-blur-md">
                        <span className="font-mono text-xs text-ink-faint">Task Detail</span>
                        <div className="flex items-center gap-2">
                            <button onClick={handleDelete} className="rounded p-1.5 text-ink-faint hover:bg-critical/10 hover:text-critical">
                                <Trash2 size={16} />
                            </button>
                            <button onClick={onClose} className="flex items-center gap-1.5 rounded bg-surface-high px-2 py-1.5 text-ink-muted hover:bg-white/10 hover:text-ink">
                                <X size={16} />
                                <kbd className="rounded bg-surface-high px-1 font-mono text-[10px] text-ink-faint">ESC</kbd>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-5">
                        <div className="mb-2 flex items-center gap-2">
                            <Badge tone={task.priority === "critical" ? "critical" : task.priority === "high" ? "warning" : "accent"}>
                                {task.priority}
                            </Badge>
                        </div>
                        <h3 className="font-display text-xl font-semibold leading-tight text-ink">{task.title}</h3>
                        {task.description && <p className="mt-2 text-sm text-ink-muted">{task.description}</p>}

                        {/* Command matrix: status / due / assignee */}
                        <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-surface-high p-2">
                            <div className="rounded bg-surface p-2.5">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Status</span>
                                <select
                                    value={task.status}
                                    onChange={(event) => handleStatusChange(event.target.value)}
                                    className="mt-1 flex w-full items-center gap-1.5 bg-transparent text-sm font-medium text-ink outline-none"
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option} className="bg-surface">{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="rounded bg-surface p-2.5">
                                <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">Due Window</span>
                                <div className="mt-1 flex items-center gap-1.5">
                                    {dueMeta ? (
                                        <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${dueMeta.tone}`}>
                                            <AlarmClock size={10} />
                                            {dueMeta.label}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-ink-faint">—</span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded bg-surface p-2.5">
                                <span className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-ink-faint">
                                    Assignee
                                    {!isLead && <Lock size={10} className="text-accent-400" />}
                                </span>
                                {isLead ? (
                                    <select
                                        value={task.assignTo?._id || ""}
                                        onChange={(event) => handleAssigneeChange(event.target.value)}
                                        className="mt-1 w-full bg-transparent text-sm font-medium text-ink outline-none"
                                    >
                                        <option value="" className="bg-surface">Unassigned</option>
                                        {members.map((member) => (
                                            <option key={member._id} value={member._id} className="bg-surface">{member.username}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="mt-1 truncate text-sm font-medium text-ink">{task.assignTo?.username || "Unassigned"}</p>
                                )}
                            </div>
                        </div>

                        {/* AI summary */}
                        <div className="mt-5 rounded-xl border border-accent-500/20 bg-accent-500/5 p-4">
                            <div className="flex items-center justify-between">
                                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                                    <Sparkles size={14} className="text-accent-400" />
                                    AI Summary
                                </p>
                                <button
                                    onClick={handleSummarize}
                                    disabled={summarizing}
                                    className="font-mono text-[11px] font-semibold text-accent-400 hover:text-accent-300"
                                >
                                    {summarizing ? "Summarizing..." : "Generate"}
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-ink-muted">
                                {summary || "Click Generate to get an AI-written summary of this task."}
                            </p>
                        </div>

                        {/* Subtasks */}
                        <div className="mt-5 rounded-xl bg-surface-high p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-ink">
                                        <ListChecks size={14} />
                                        Subtasks
                                    </span>
                                    {subtasks.length > 0 && (
                                        <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] font-bold text-accent-300">
                                            {doneCount} of {subtasks.length} completed
                                        </span>
                                    )}
                                </div>
                                {subtasks.length > 0 && <span className="font-mono text-xs font-bold text-ink-faint">{subtaskPercent}%</span>}
                            </div>

                            {subtasks.length > 0 && (
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                                    <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${subtaskPercent}%` }} />
                                </div>
                            )}

                            <form onSubmit={handleAddSubtask} className="mt-3 flex gap-2">
                                <input
                                    value={newSubtaskTitle}
                                    onChange={(event) => setNewSubtaskTitle(event.target.value)}
                                    placeholder="Add a subtask..."
                                    className="flex-1 rounded border border-border bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-accent-500"
                                />
                                <Button type="submit" disabled={addingSubtask} className="!px-3 !py-1.5">
                                    <Plus size={14} />
                                </Button>
                            </form>

                            <div className="mt-3 space-y-1.5">
                                {loadingSubtasks && <p className="text-xs text-ink-faint">Loading subtasks...</p>}
                                {subtasks.map((subtask) => (
                                    <div key={subtask._id} className="flex items-center justify-between gap-2 rounded bg-surface p-2 transition hover:bg-surface-hover">
                                        <label className="flex flex-1 cursor-pointer items-center gap-2.5 select-none">
                                            <input
                                                type="checkbox"
                                                checked={subtask.status === "Done"}
                                                onChange={(event) => handleToggleSubtask(subtask, event.target.checked ? "Done" : "Todo")}
                                                className="h-4 w-4 accent-accent-500"
                                            />
                                            <span className={`text-sm ${subtask.status === "Done" ? "text-ink-faint line-through" : "text-ink"}`}>
                                                {subtask.title}
                                            </span>
                                        </label>
                                        <select
                                            value={subtask.status}
                                            onChange={(event) => handleToggleSubtask(subtask, event.target.value)}
                                            className="rounded bg-surface-high px-2 py-1 font-mono text-[10px] text-ink-muted outline-none"
                                        >
                                            <option value="Todo">Todo</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                        <button onClick={() => handleDeleteSubtask(subtask._id)} className="text-ink-faint hover:text-critical">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                                {!loadingSubtasks && subtasks.length === 0 && (
                                    <p className="text-xs text-ink-faint">No subtasks yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="mt-5">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-ink">
                                    <Paperclip size={14} />
                                    Attachments ({attachments.length})
                                </span>
                            </div>

                            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-surface-high p-4 text-center transition hover:bg-white/[0.06]">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-accent-400">
                                    <Plus size={16} />
                                </div>
                                <span className="text-xs font-semibold text-ink">
                                    {uploadingFile ? "Uploading..." : "Click to upload a file"}
                                </span>
                                <input type="file" onChange={handleFileUpload} className="hidden" />
                            </label>

                            {attachments.length > 0 && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {attachments.map((url, index) => {
                                        const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(url)
                                        const ext = url.split(".").pop()?.slice(0, 4).toUpperCase()
                                        return (
                                            <div
                                                key={index}
                                                className="group relative flex items-center gap-2.5 rounded-lg bg-surface-high p-2.5 transition hover:bg-white/[0.06]"
                                            >
                                                <a href={url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-2.5">
                                                    {isImage ? (
                                                        <img src={url} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
                                                    ) : (
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-surface font-mono text-[9px] font-bold text-accent-300">
                                                            {ext}
                                                        </div>
                                                    )}
                                                    <span className="truncate text-xs text-ink-muted">{url.split("/").pop()}</span>
                                                </a>
                                                <button
                                                    onClick={() => handleRemoveAttachment(url)}
                                                    disabled={removingUrl === url}
                                                    title="Remove attachment"
                                                    className="shrink-0 rounded p-1 text-ink-faint opacity-0 transition hover:bg-critical/10 hover:text-critical group-hover:opacity-100"
                                                >
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Comments */}
                        <div className="mt-5">
                            <p className="mb-3 font-display text-sm font-semibold text-ink">Comments</p>
                            <div className="space-y-3">
                                {loadingComments && <p className="text-xs text-ink-faint">Loading comments...</p>}
                                {comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-3">
                                        <img src={comment.author?.profileImage} className="h-8 w-8 rounded-full object-cover" alt="" />
                                        <div className="flex-1 rounded-lg bg-surface-high px-3 py-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold text-ink">{comment.author?.username}</p>
                                                <p className="font-mono text-[10px] text-ink-faint">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                                            </div>
                                            <p className="mt-1 text-sm text-ink-muted">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {!loadingComments && comments.length === 0 && (
                                    <p className="text-xs text-ink-faint">No comments yet. Start the discussion below.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t border-border bg-surface px-5 py-4">
                        <input
                            value={commentText}
                            onChange={(event) => setCommentText(event.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                        />
                        <Button type="submit" className="!px-3">
                            <Send size={16} />
                        </Button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default TaskDetailDrawer
