import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, FolderKanban, Search, MoreHorizontal } from "lucide-react"
import toast from "react-hot-toast"
import { fetchProjects, updateProject } from "../features/project/projectSlice"
import { EmptyState, Skeleton, Button } from "../components/ui/Primitives"
import CreateProjectModal from "../components/project/CreateProjectModal"
import ProjectIcon from "../components/project/ProjectIcon"

const statusPillTone = {
    Active: "bg-success/15 text-success",
    "On Hold": "bg-warning/15 text-warning",
    Completed: "bg-info/15 text-info"
}

const filterTabs = ["All", "Active", "On Hold", "Completed"]

const ProjectsPage = () => {
    const dispatch = useDispatch()
    const { list: projects, status } = useSelector((state) => state.project)
    const { user } = useSelector((state) => state.auth)
    const [modalOpen, setModalOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [activeFilter, setActiveFilter] = useState("All")

    useEffect(() => {
        dispatch(fetchProjects())
    }, [dispatch])

    const filteredProjects = projects
        .filter((project) => project.projectName.toLowerCase().includes(search.toLowerCase()))
        .filter((project) => activeFilter === "All" || project.status === activeFilter)

    const handleStatusChange = async (event, projectId) => {
        event.preventDefault()
        event.stopPropagation()
        const newStatus = event.target.value

        const result = await dispatch(updateProject({ id: projectId, payload: { status: newStatus } }))
        if (updateProject.fulfilled.match(result)) {
            toast.success(`Marked As ${newStatus}`)
        } else {
            toast.error("Could Not Update Status")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-ink">Projects</h1>
                    <p className="mt-1 text-sm text-ink-muted">All the projects you own or are a member of.</p>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus size={16} />
                    New Project
                </Button>
            </div>

            <div className="flex flex-col items-stretch gap-3 rounded-lg border border-border bg-surface p-3 lg:flex-row lg:items-center">
                <div className="relative flex flex-1 items-center">
                    <Search size={15} className="absolute left-3 text-ink-faint" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Filter projects by name..."
                        className="w-full rounded border border-border bg-canvas py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-accent-500"
                    />
                </div>
                <div className="flex items-center gap-1 rounded bg-canvas p-1">
                    {filterTabs.map((tab) => {
                        const count = tab === "All" ? projects.length : projects.filter((project) => project.status === tab).length
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`rounded px-3 py-1.5 text-xs font-medium transition ${
                                    activeFilter === tab ? "bg-surface-high text-ink" : "text-ink-muted hover:text-ink"
                                }`}
                            >
                                {tab} ({count})
                            </button>
                        )
                    })}
                </div>
            </div>

            {status === "loading" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                        <Skeleton key={index} className="h-52 w-full" />
                    ))}
                </div>
            ) : filteredProjects.length === 0 ? (
                <EmptyState
                    icon={FolderKanban}
                    title="No Projects Found"
                    description="Create your first project to start organizing tasks for your team."
                    action={<Button onClick={() => setModalOpen(true)}><Plus size={16} />Create Project</Button>}
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project, index) => (
                        <motion.div
                            key={project._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-all hover:border-border-strong hover:bg-surface-hover"
                        >
                            <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between">
                                    <ProjectIcon icon={project.projectIcon} name={project.projectName} size={40} />
                                    <div className="flex items-center gap-1">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusPillTone[project.status] || "bg-white/5 text-ink-muted"}`}>
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                                            {project.status}
                                        </span>
                                        <button className="rounded p-1 text-ink-faint opacity-0 transition group-hover:opacity-100 hover:bg-white/5 hover:text-ink">
                                            <MoreHorizontal size={15} />
                                        </button>
                                    </div>
                                </div>

                                <Link to={`/dashboard/projects/${project._id}`}>
                                    <p className="font-mono text-[11px] uppercase tracking-wide text-accent-300">{project.projectKey}</p>
                                    <h3 className="mt-1 font-display text-base font-semibold text-ink">{project.projectName}</h3>
                                    {project.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{project.description}</p>
                                    )}
                                </Link>

                                {project.projectType && (
                                    <div className="flex flex-wrap gap-1.5">
                                        <span className="rounded bg-white/5 px-2 py-1 font-mono text-[10px] text-ink-muted">
                                            #{project.projectType.toLowerCase().replace(/\s+/g, "-")}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                                <div className="flex -space-x-2">
                                    {project.members?.slice(0, 4).map((member) => (
                                        <img
                                            key={member._id}
                                            src={member.profileImage}
                                            alt={member.username}
                                            title={member.username}
                                            className="h-6 w-6 rounded-full border-2 border-surface object-cover"
                                        />
                                    ))}
                                </div>

                                {project.projectLead?._id === user?._id && (
                                    <select
                                        value={project.status}
                                        onClick={(event) => event.stopPropagation()}
                                        onChange={(event) => handleStatusChange(event, project._id)}
                                        className="rounded border border-border bg-canvas px-2 py-1 text-[11px] text-ink-muted outline-none focus:border-accent-500"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="On Hold">On Hold</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
        </div>
    )
}

export default ProjectsPage
