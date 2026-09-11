import { useState } from "react"
import { useDispatch } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Zap } from "lucide-react"
import toast from "react-hot-toast"
import { createProject } from "../../features/project/projectSlice"
import { Button } from "../ui/Primitives"
import IconPicker from "./IconPicker"
import api from "../../api/axios"

const CreateProjectModal = ({ open, onClose }) => {
    const dispatch = useDispatch()
    const [generating, setGenerating] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        projectName: "",
        projectKey: "",
        projectType: "",
        projectIcon: "📁",
        startDate: "",
        endDate: "",
        status: "Active"
    })

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value })
    }

    const handleGenerateDescription = async () => {
        if (!form.projectName) {
            toast.error("Enter A Project Name First")
            return
        }
        try {
            setGenerating(true)
            const { data } = await api.post("/ai/project-description", {
                projectName: form.projectName,
                projectType: form.projectType
            })
            setForm((prev) => ({ ...prev, description: data.description }))
            toast.success("AI Description Generated")
        } catch (error) {
            toast.error(error.message || "Could Not Generate Description")
        } finally {
            setGenerating(false)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitting(true)

        const result = await dispatch(createProject(form))

        if (createProject.fulfilled.match(result)) {
            toast.success("Project Created Successfully")
            setForm({ projectName: "", projectKey: "", projectType: "", projectIcon: "📁", startDate: "", endDate: "", status: "Active" })
            onClose()
        } else {
            toast.error(result.payload || "Could Not Create Project")
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
                                <Zap size={16} className="text-accent-400" />
                                Initialize Project
                            </h2>
                            <button onClick={onClose} className="rounded p-1 text-ink-faint hover:bg-white/5 hover:text-ink">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Choose An Icon</label>
                                <IconPicker value={form.projectIcon} onChange={(icon) => setForm((prev) => ({ ...prev, projectIcon: icon }))} />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Project Name</label>
                                    <input
                                        name="projectName"
                                        required
                                        value={form.projectName}
                                        onChange={handleChange}
                                        className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                        placeholder="Website Redesign"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Project Key</label>
                                    <input
                                        name="projectKey"
                                        required
                                        value={form.projectKey}
                                        onChange={handleChange}
                                        className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm uppercase text-ink outline-none focus:border-accent-500"
                                        placeholder="WEB"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Description</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateDescription}
                                    disabled={generating}
                                    className="flex items-center gap-1 text-xs font-semibold text-accent-400 hover:text-accent-300 disabled:opacity-60"
                                >
                                    <Sparkles size={13} />
                                    {generating ? "Generating..." : "Generate With AI"}
                                </button>
                            </div>
                            <textarea
                                name="description"
                                rows={3}
                                value={form.description || ""}
                                onChange={handleChange}
                                className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                placeholder="What is this project about?"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Start Date</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        required
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
                                        required
                                        value={form.endDate}
                                        onChange={handleChange}
                                        className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Project Type</label>
                                <input
                                    name="projectType"
                                    value={form.projectType}
                                    onChange={handleChange}
                                    className="w-full rounded border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                                    placeholder="Web App, Mobile App, Internal Tool..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button type="button" onClick={onClose} className="rounded px-4 py-2 text-sm text-ink-muted hover:text-ink">
                                    Cancel
                                </button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting ? "Creating..." : "Deploy Project"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default CreateProjectModal
