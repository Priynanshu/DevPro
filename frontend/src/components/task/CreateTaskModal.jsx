import { useState } from "react"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, ListPlus } from "lucide-react"
import toast from "react-hot-toast"
import { createTask } from "../../features/task/taskSlice"
import { Button } from "../ui/Primitives"
import api from "../../api/axios"

const CreateTaskModal = ({ open, onClose, projectId, members = [], isLead = false }) => {
    const dispatch = useDispatch()
    const [submitting, setSubmitting] = useState(false)
    const [suggesting, setSuggesting] = useState(false)
    const [form, setForm] = useState({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignTo: ""
    })

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const handleSuggestPriority = async () => {
        if (!form.title) {
            toast.error("Enter A Task Title First")
            return
        }
        try {
            setSuggesting(true)
            const { data } = await api.post("/ai/suggest-priority", form)
            setForm((prev) => ({ ...prev, priority: data.priority }))
            toast.success(`AI Suggests: ${data.priority}`)
        } catch (error) {
            toast.error(error.message || "Could Not Suggest Priority")
        } finally {
            setSuggesting(false)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)

        const payload = { ...form, assignTo: form.assignTo || undefined }
        const result = await dispatch(createTask({ projectId, payload }))

        if (createTask.fulfilled.match(result)) {
            toast.success("Task Created Successfully")
            setForm({ title: "", description: "", priority: "medium", dueDate: "", assignTo: "" })
            onClose()
        } else {
            toast.error(result.payload || "Could Not Create Task")
        }
        setSubmitting(false)
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        onClick={(event) => event.stopPropagation()}
                        className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                                <ListPlus size={16} className="text-accent-400" />
                                Create New Task
                            </h2>
                            <button onClick={onClose} className="rounded p-1 text-ink-faint hover:bg-white/5 hover:text-ink">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Task Title</label>
                                <input
                                    name="title"
                                    required
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                    placeholder="Design the login screen"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Priority</label>
                                        <button
                                            type="button"
                                            onClick={handleSuggestPriority}
                                            disabled={suggesting}
                                            className="flex items-center gap-1 text-xs font-semibold text-accent-400 hover:text-accent-300"
                                        >
                                            <Sparkles size={12} />
                                            {suggesting ? "..." : "AI Suggest"}
                                        </button>
                                    </div>
                                    <select
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleChange}
                                        className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        value={form.dueDate}
                                        onChange={handleChange}
                                        className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                    />
                                </div>
                            </div>

                            {isLead && (
                                <div>
                                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Assign To</label>
                                    <select
                                        name="assignTo"
                                        value={form.assignTo}
                                        onChange={handleChange}
                                        className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((member) => (
                                            <option key={member._id} value={member._id}>{member.username}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <Button type="submit" disabled={submitting} className="w-full">
                                {submitting ? "Creating..." : "Create Task"}
                            </Button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default CreateTaskModal
