import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, UserPlus, Clock, X, Crown } from "lucide-react"
import toast from "react-hot-toast"
import { fetchProjectById } from "../features/project/projectSlice"
import { Card, Button, Skeleton } from "../components/ui/Primitives"
import api from "../api/axios"

const TeamPage = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const { current: project } = useSelector((state) => state.project)
    const { user } = useSelector((state) => state.auth)

    const [email, setEmail] = useState("")
    const [sending, setSending] = useState(false)
    const [invites, setInvites] = useState([])
    const [loadingInvites, setLoadingInvites] = useState(true)

    const isLead = project?.projectLead?._id === user?._id

    useEffect(() => {
        dispatch(fetchProjectById(id))
        loadInvites()
    }, [id])

    const loadInvites = async () => {
        try {
            setLoadingInvites(true)
            const { data } = await api.get(`/invitations/project/${id}/all`)
            setInvites(data.invites.filter((invite) => invite.status === "pending"))
        } catch (error) {
            toast.error("Could Not Load Invites")
        } finally {
            setLoadingInvites(false)
        }
    }

    const handleInvite = async (event) => {
        event.preventDefault()
        if (!email.trim()) return

        try {
            setSending(true)
            await api.post(`/invitations/project/${id}/invite`, { email: email.trim() })
            toast.success(`Invite Sent To ${email}`)
            setEmail("")
            loadInvites()
        } catch (error) {
            toast.error(error.message || "Could Not Send Invite")
        } finally {
            setSending(false)
        }
    }

    const handleCancelInvite = async (inviteId) => {
        try {
            await api.delete(`/invitations/cancel/${inviteId}`)
            setInvites((prev) => prev.filter((invite) => invite._id !== inviteId))
            toast.success("Invite Cancelled")
        } catch (error) {
            toast.error("Could Not Cancel Invite")
        }
    }

    if (!project) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Link to={`/dashboard/projects/${id}`} className="inline-flex items-center gap-1 text-sm font-medium text-accent-400 hover:text-accent-300">
                <ArrowLeft size={16} />
                Back to {project.projectName}
            </Link>

            <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-widest text-accent-300">Project // Roster</span>
                <h1 className="font-display text-2xl font-bold text-ink">Team</h1>
                <p className="text-sm text-ink-muted">Manage who has access to {project.projectName}.</p>
            </div>

            {isLead && (
                <Card>
                    <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-ink-muted">Invite A Member</h3>
                    <form onSubmit={handleInvite} className="flex gap-2">
                        <div className="flex flex-1 items-center gap-2 rounded border border-border bg-canvas px-3 py-2">
                            <Mail size={16} className="text-ink-faint" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="teammate@example.com"
                                className="w-full bg-transparent text-sm text-ink outline-none"
                            />
                        </div>
                        <Button type="submit" disabled={sending}>
                            <UserPlus size={16} />
                            {sending ? "Sending..." : "Send Invite"}
                        </Button>
                    </form>
                    <p className="mt-2 text-xs text-ink-faint">
                        They'll receive an email with links to accept or reject the invite. Accepting requires an existing DevPro account with that email.
                    </p>
                </Card>
            )}

            <div className="overflow-hidden rounded-lg border border-border bg-surface">
                <div className="border-b border-border px-4 py-3">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-ink-muted">Directory Roster ({project.members?.length})</h3>
                </div>
                <div className="divide-y divide-border">
                    {project.members?.map((member) => (
                        <div key={member._id} className="flex items-center justify-between px-4 py-3 transition hover:bg-white/[0.03]">
                            <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <img src={member.profileImage} className="h-10 w-10 rounded-full object-cover" alt="" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-ink">{member.username}</span>
                                        {project.projectLead?._id === member._id && (
                                            <span className="flex items-center gap-1 rounded-full bg-accent-500 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                                                <Crown size={10} />
                                                LEAD
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-mono text-[11px] text-ink-faint">{member.email}</span>
                                </div>
                            </div>
                            <span className="hidden font-mono text-[11px] capitalize text-ink-muted sm:block">{member.role}</span>
                        </div>
                    ))}
                </div>
            </div>

            {isLead && (
                <Card>
                    <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-ink-muted">Pending Invites</h3>
                    {loadingInvites ? (
                        <Skeleton className="h-16 w-full" />
                    ) : invites.length === 0 ? (
                        <p className="text-sm text-ink-faint">No pending invites.</p>
                    ) : (
                        <div className="space-y-2">
                            {invites.map((invite) => (
                                <motion.div
                                    key={invite._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-between rounded border border-border px-4 py-3"
                                >
                                    <div className="flex items-center gap-2 text-sm text-ink-muted">
                                        <Clock size={14} className="text-warning" />
                                        {invite.email}
                                    </div>
                                    <button onClick={() => handleCancelInvite(invite._id)} className="text-ink-faint hover:text-critical">
                                        <X size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    )
}

export default TeamPage
