import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useParams, Link, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Sparkles, Filter, Settings, Users } from "lucide-react"
import toast from "react-hot-toast"
import { fetchProjectById, clearCurrentProject } from "../features/project/projectSlice"
import { fetchTasksByProject, updateTask, createTask } from "../features/task/taskSlice"
import { Card, Button, Skeleton } from "../components/ui/Primitives"
import TaskCard from "../components/task/TaskCard"
import CreateTaskModal from "../components/task/CreateTaskModal"
import TaskDetailDrawer from "../components/task/TaskDetailDrawer"
import EditProjectModal from "../components/project/EditProjectModal"
import AddColumnModal from "../components/project/AddColumnModal"
import ProjectIcon from "../components/project/ProjectIcon"
import api from "../api/axios"

const ProjectDetailPage = () => {
    const { id } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const dispatch = useDispatch()
    const { current: project } = useSelector((state) => state.project)
    const { list: tasks, status } = useSelector((state) => state.task)
    const { user } = useSelector((state) => state.auth)

    const [taskModalOpen, setTaskModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false)
    const [columnModalOpen, setColumnModalOpen] = useState(false)
    const [activeTask, setActiveTask] = useState(null)
    const [priorityFilter, setPriorityFilter] = useState("")
    const [aiTasks, setAiTasks] = useState([])
    const [generatingTasks, setGeneratingTasks] = useState(false)
    const [goal, setGoal] = useState("")
    const [showAiPanel, setShowAiPanel] = useState(false)

    useEffect(() => {
        dispatch(fetchProjectById(id))
        dispatch(fetchTasksByProject({ projectId: id, filters: {} }))

        return () => dispatch(clearCurrentProject())
    }, [dispatch, id])

    useEffect(() => {
        dispatch(fetchTasksByProject({ projectId: id, filters: priorityFilter ? { priority: priorityFilter } : {} }))
    }, [priorityFilter])

    useEffect(() => {
        const taskIdFromUrl = searchParams.get("task")
        if (taskIdFromUrl && tasks.length > 0) {
            const foundTask = tasks.find((task) => task._id === taskIdFromUrl)
            if (foundTask) {
                setActiveTask(foundTask)
                setSearchParams({}, { replace: true })
            }
        }
    }, [tasks])

    const handleDragStart = (event, task) => {
        event.dataTransfer.setData("taskId", task._id)
    }

    const handleDrop = async (event, newStatus) => {
        const taskId = event.dataTransfer.getData("taskId")
        const task = tasks.find((item) => item._id === taskId)

        if (newStatus.trim().toLowerCase() === "done" && task?.subtasks?.length > 0) {
            const allSubtasksDone = task.subtasks.every((subtask) => subtask.status === "Done")
            if (!allSubtasksDone) {
                toast.error("Complete All Subtasks Before Marking This Task As Done")
                return
            }
        }

        const result = await dispatch(updateTask({ id: taskId, payload: { status: newStatus } }))
        if (updateTask.fulfilled.match(result)) {
            toast.success(`Moved To ${newStatus}`)
        }
    }

    const handleGenerateTasks = async () => {
        if (!goal.trim()) {
            toast.error("Describe A Goal First")
            return
        }
        try {
            setGeneratingTasks(true)
            const { data } = await api.post("/ai/task-suggestions", { projectName: project?.projectName, goal })
            setAiTasks(data.tasks)
        } catch (error) {
            toast.error(error.message || "Could Not Generate Tasks")
        } finally {
            setGeneratingTasks(false)
        }
    }

    const handleAddAiTask = async (title) => {
        const result = await dispatch(createTask({ projectId: id, payload: { title, priority: "medium" } }))
        if (createTask.fulfilled.match(result)) {
            setAiTasks((prev) => prev.filter((task) => task !== title))
            toast.success("Task Added")
        }
    }

    if (!project) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 sm:grid-cols-3">
                    {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-64 w-full" />)}
                </div>
            </div>
        )
    }

    const columns = [...(project.columns || [])].sort((a, b) => a.order - b.order)
    const isLead = project.projectLead?._id === user?._id

    return (
        <div className="space-y-6">
            <Link to="/dashboard/projects" className="inline-flex items-center gap-1 text-sm font-medium text-accent-400 hover:text-accent-300">
                <ArrowLeft size={16} />
                Back to Projects
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <ProjectIcon icon={project.projectIcon} name={project.projectName} size={44} />
                    <div>
                        <h1 className="font-display text-2xl font-bold text-ink">{project.projectName}</h1>
                        <p className="mt-0.5 text-sm text-ink-muted">{project.description || "No description provided."}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/dashboard/projects/${id}/team`}>
                        <Button variant="outline">
                            <Users size={16} />
                            Team
                        </Button>
                    </Link>
                    <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                        <Settings size={16} />
                        Edit
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2">
                    <Filter size={14} className="text-ink-faint" />
                    <select
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value)}
                        className="bg-transparent text-sm text-ink outline-none"
                    >
                        <option value="">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <Button variant="outline" onClick={() => setColumnModalOpen(true)}>
                    <Plus size={16} />
                    Add Status
                </Button>
                <Button variant="outline" onClick={() => setShowAiPanel((open) => !open)}>
                    <Sparkles size={16} />
                    AI Tasks
                </Button>
                <Button onClick={() => setTaskModalOpen(true)} className="ml-auto">
                    <Plus size={16} />
                    New Task
                </Button>
            </div>

            {showAiPanel && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <Card>
                        <p className="mb-3 text-sm font-semibold text-ink">Describe a goal, let AI suggest tasks</p>
                        <div className="flex gap-2">
                            <input
                                value={goal}
                                onChange={(event) => setGoal(event.target.value)}
                                placeholder="e.g. Launch the new landing page by next week"
                                className="flex-1 rounded-md border border-border bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent-500"
                            />
                            <Button onClick={handleGenerateTasks} disabled={generatingTasks}>
                                {generatingTasks ? "Thinking..." : "Generate"}
                            </Button>
                        </div>
                        {aiTasks.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {aiTasks.map((task) => (
                                    <div key={task} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
                                        <p className="text-sm text-ink-muted">{task}</p>
                                        <button onClick={() => handleAddAiTask(task)} className="text-xs font-semibold text-accent-400 hover:text-accent-300">
                                            + Add
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </motion.div>
            )}

            {status === "loading" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                    {columns.map((column) => <Skeleton key={column.name} className="h-72 w-full" />)}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {columns.map((column) => (
                        <div
                            key={column.name}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleDrop(event, column.name)}
                            className="w-72 shrink-0 rounded-lg bg-surface/50 p-3"
                        >
                            <div className="mb-3 flex items-center justify-between px-1">
                                <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink-muted">{column.name}</p>
                                <span className="rounded bg-surface px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-muted">
                                    {tasks.filter((task) => task.status === column.name).length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {tasks.filter((task) => task.status === column.name).length === 0 ? (
                                    <p className="px-1 text-xs text-ink-faint">No tasks here yet</p>
                                ) : (
                                    tasks.filter((task) => task.status === column.name).map((task) => (
                                        <TaskCard key={task._id} task={task} onClick={setActiveTask} onDragStart={handleDragStart} />
                                    ))
                                )}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setColumnModalOpen(true)}
                        className="flex h-fit w-56 shrink-0 items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-sm font-medium text-accent-400 transition hover:bg-white/5"
                    >
                        <Plus size={16} />
                        Add Column
                    </button>
                </div>
            )}

            <CreateTaskModal
                open={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                projectId={id}
                members={project.members}
                isLead={isLead}
            />

            <EditProjectModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                project={project}
            />

            <AddColumnModal
                open={columnModalOpen}
                onClose={() => setColumnModalOpen(false)}
                project={project}
            />

            {activeTask && (
                <TaskDetailDrawer
                    task={tasks.find((task) => task._id === activeTask._id) || activeTask}
                    onClose={() => setActiveTask(null)}
                    members={project.members}
                    columns={columns}
                    isLead={isLead}
                />
            )}
        </div>
    )
}

export default ProjectDetailPage
