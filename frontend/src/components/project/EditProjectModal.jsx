import { useState } from "react"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Trash2, AlertTriangle, Settings } from "lucide-react"
import toast from "react-hot-toast"
import { updateProject, deleteProject } from "../../features/project/projectSlice"
import { Button } from "../ui/Primitives"
import IconPicker from "./IconPicker"
import ProjectIcon from "./ProjectIcon"

const EditProjectModal = ({ open, onClose, project }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [submitting, setSubmitting] = useState(false)
    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [columns, setColumns] = useState(project?.columns?.map((column) => column.name) || [])

    const [form, setForm] = useState({
        projectName: project?.projectName || "",
        description: project?.description || "",
        projectType: project?.projectType || "",
        status: project?.status || "Active",
        projectIcon: project?.projectIcon || "📁",
        startDate: project?.startDate?.slice(0, 10) || "",
        endDate: project?.endDate?.slice(0, 10) || ""
    })

    if (!project) return null

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const handleRemoveColumn = (index) => {
        if (columns.length <= 1) {
            toast.error("A Project Needs At Least One Column")
            return
        }
        setColumns((prev) => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)

        const result = await dispatch(updateProject({ id: project._id, payload: { ...form, columns } }))

        if (updateProject.fulfilled.match(result)) {
            toast.success("Project Updated Successfully")
            onClose()
        } else {
            toast.error(result.payload || "Could Not Update Project")
        }
        setSubmitting(false)
    }

    const handleDelete = async () => {
        setDeleting(true)
        const result = await dispatch(deleteProject(project._id))

        if (deleteProject.fulfilled.match(result)) {
            toast.success("Project Deleted")
            onClose()
            navigate("/dashboard/projects")
        } else {
            toast.error(result.payload || "Could Not Delete Project")
        }
        setDeleting(false)
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
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-2xl"
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                                <Settings size={16} className="text-accent-400" />
                                Edit Project
                            </h2>
                            <button onClick={onClose} className="rounded p-1 text-ink-faint hover:bg-white/5 hover:text-ink">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-5 flex items-center gap-4">
                            <ProjectIcon icon={form.projectIcon} name={form.projectName} size={56} />
                            <div className="flex-1">
                                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">Project Icon</p>
                                <IconPicker value={form.projectIcon} onChange={(icon) => setForm((prev) => ({ ...prev, projectIcon: icon }))} />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Project Name</label>
                                <input
                                    name="projectName"
                                    value={form.projectName}
                                    onChange={handleChange}
                                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
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
                                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">End Date</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={form.endDate}
                                        onChange={handleChange}
                                        className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Status</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                    <option value="On Hold">On Hold</option>
                                </select>
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full">
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>

                        <div className="mt-5 border-t border-border pt-4">
                            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-muted">Workflow Columns</p>
                            <div className="space-y-2">
                                {columns.map((column, index) => (
                                    <div key={index} className="flex items-center gap-2 rounded bg-surface-high px-3 py-2">
                                        <span className="flex-1 text-sm text-ink">{column}</span>
                                        <button type="button" onClick={() => handleRemoveColumn(index)} className="text-ink-faint hover:text-critical">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-ink-faint">Use the "+ Add Status" button on the board to add a new column.</p>
                        </div>

                        <div className="mt-6 border-t border-critical/20 pt-4">
                            {!confirmingDelete ? (
                                <button
                                    type="button"
                                    onClick={() => setConfirmingDelete(true)}
                                    className="flex items-center gap-2 text-sm font-semibold text-critical hover:opacity-80"
                                >
                                    <Trash2 size={15} />
                                    Delete This Project
                                </button>
                            ) : (
                                <div className="rounded border border-critical/30 bg-critical/10 p-3">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-critical">
                                        <AlertTriangle size={15} />
                                        This cannot be undone. Delete "{project.projectName}"?
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                                            {deleting ? "Deleting..." : "Yes, Delete"}
                                        </Button>
                                        <Button variant="ghost" onClick={() => setConfirmingDelete(false)}>
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default EditProjectModal
