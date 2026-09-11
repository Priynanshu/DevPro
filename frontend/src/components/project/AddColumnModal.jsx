import { useState } from "react"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus } from "lucide-react"
import toast from "react-hot-toast"
import { updateProject } from "../../features/project/projectSlice"
import { Button } from "../ui/Primitives"

const AddColumnModal = ({ open, onClose, project }) => {
    const dispatch = useDispatch()
    const [columnName, setColumnName] = useState("")
    const [submitting, setSubmitting] = useState(false)

    if (!project) return null

    const handleSubmit = async (event) => {
        event.preventDefault()
        if (!columnName.trim()) return

        const existingNames = project.columns?.map((column) => column.name) || []

        if (existingNames.some((name) => name.toLowerCase() === columnName.trim().toLowerCase())) {
            toast.error("A Column With This Name Already Exists")
            return
        }

        setSubmitting(true)
        const updatedColumns = [...existingNames, columnName.trim()]

        const result = await dispatch(updateProject({ id: project._id, payload: { columns: updatedColumns } }))

        if (updateProject.fulfilled.match(result)) {
            toast.success("Column Added")
            setColumnName("")
            onClose()
        } else {
            toast.error(result.payload || "Could Not Add Column")
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
                        className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-display text-lg font-bold text-ink">Add Workflow Column</h2>
                            <button onClick={onClose} className="rounded p-1 text-ink-faint hover:bg-white/5 hover:text-ink">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Column Name</label>
                                <input
                                    autoFocus
                                    value={columnName}
                                    onChange={(event) => setColumnName(event.target.value)}
                                    placeholder="e.g. In Review"
                                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                />
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full">
                                <Plus size={16} />
                                {submitting ? "Adding..." : "Add Column"}
                            </Button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default AddColumnModal
