import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Camera, Pencil, FolderKanban, Check, X } from "lucide-react"
import toast from "react-hot-toast"
import { fetchCurrentUser } from "../features/auth/authSlice"
import { fetchProjects } from "../features/project/projectSlice"
import { fetchNotifications } from "../features/notification/notificationSlice"
import { Card, Badge, Button } from "../components/ui/Primitives"
import ImageLightbox from "../components/ui/ImageLightbox"
import api from "../api/axios"

const ProfilePage = () => {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { list: projects } = useSelector((state) => state.project)
    const { list: notifications } = useSelector((state) => state.notification)

    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)
    const [editing, setEditing] = useState(false)
    const [dpOpen, setDpOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ username: user?.username || "", bio: user?.bio || "", role: user?.role || "member" })

    useEffect(() => {
        dispatch(fetchProjects())
        dispatch(fetchNotifications())
    }, [dispatch])

    const handleProfileImageChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("image", file)

        try {
            setUploadingImage(true)
            await api.put("/auth/profile-image", formData, { headers: { "Content-Type": "multipart/form-data" } })
            await dispatch(fetchCurrentUser())
            toast.success("Profile Image Updated")
        } catch (error) {
            toast.error(error.message || "Could Not Update Image")
        } finally {
            setUploadingImage(false)
        }
    }

    const handleCoverImageChange = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("image", file)

        try {
            setUploadingCover(true)
            await api.put("/auth/cover-image", formData, { headers: { "Content-Type": "multipart/form-data" } })
            await dispatch(fetchCurrentUser())
            toast.success("Cover Image Updated")
        } catch (error) {
            toast.error(error.message || "Could Not Update Cover")
        } finally {
            setUploadingCover(false)
        }
    }

    const handleSaveProfile = async () => {
        try {
            setSaving(true)
            await api.put("/auth/profile", form)
            await dispatch(fetchCurrentUser())
            setEditing(false)
            toast.success("Profile Updated")
        } catch (error) {
            toast.error(error.message || "Could Not Update Profile")
        } finally {
            setSaving(false)
        }
    }

    const myProjects = projects.filter((project) =>
        project.members?.some((member) => member._id === user?._id)
    )

    const recentActivity = notifications.slice(0, 6)

    return (
        <div className="mx-auto max-w-4xl space-y-6 pb-10">
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="relative h-40 bg-gradient-to-r from-accent-400 to-accent-600">
                    {user?.coverImage && (
                        <img src={user.coverImage} alt="" className="h-full w-full object-cover" />
                    )}
                    <label className="absolute right-4 top-4 flex cursor-pointer items-center gap-1.5 rounded-lg bg-surface/90 px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface">
                        <Camera size={13} />
                        {uploadingCover ? "Uploading..." : "Change Cover"}
                        <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                    </label>
                </div>

                <div className="px-6 pb-6">
                    <div className="-mt-10 flex items-end justify-between">
                        <div className="relative">
                            <img
                                src={user?.profileImage}
                                alt={user?.username}
                                onClick={() => setDpOpen(true)}
                                className="h-20 w-20 cursor-pointer rounded-full border-4 border-surface object-cover shadow"
                            />
                            <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-accent-500 text-white shadow-md hover:bg-accent-600">
                                <Camera size={13} />
                                <input type="file" accept="image/*" onChange={handleProfileImageChange} className="hidden" />
                            </label>
                        </div>

                        {!editing && (
                            <Button variant="outline" onClick={() => setEditing(true)} className="mb-1">
                                <Pencil size={14} />
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {editing ? (
                        <div className="mt-4 space-y-3">
                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Name</label>
                                <input
                                    value={form.username}
                                    onChange={(event) => setForm({ ...form, username: event.target.value })}
                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Bio</label>
                                <textarea
                                    rows={3}
                                    maxLength={300}
                                    value={form.bio}
                                    onChange={(event) => setForm({ ...form, bio: event.target.value })}
                                    placeholder="Tell your team a bit about yourself..."
                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent-500"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-ink-muted">Role</label>
                                <select
                                    value={form.role}
                                    onChange={(event) => setForm({ ...form, role: event.target.value })}
                                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-accent-500"
                                >
                                    <option value="member">Member</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="backend engineer">Backend Engineer</option>
                                    <option value="frontend developer">Frontend Developer</option>
                                    <option value="designer">Designer</option>
                                    <option value="qa engineer">QA Engineer</option>
                                    <option value="product owner">Product Owner</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSaveProfile} disabled={saving}>
                                    <Check size={14} />
                                    {saving ? "Saving..." : "Save"}
                                </Button>
                                <Button variant="ghost" onClick={() => { setEditing(false); setForm({ username: user?.username, bio: user?.bio }) }}>
                                    <X size={14} />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <h1 className="font-display text-xl font-bold text-ink">{user?.username}</h1>
                            <p className="text-sm text-ink-faint">{user?.email}</p>
                            <p className="mt-2 text-sm text-ink-muted">{user?.bio || "No bio added yet."}</p>
                            <span className="mt-3 inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-accent-400">
                                {user?.role}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                    <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold uppercase text-ink">
                        <FolderKanban size={16} />
                        Projects Worked On ({myProjects.length})
                    </h3>
                    {myProjects.length === 0 ? (
                        <p className="text-sm text-ink-faint">You haven't joined any projects yet.</p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2">
                            {myProjects.map((project) => (
                                <div key={project._id} className="flex items-center justify-between rounded border border-border bg-canvas px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-ink">{project.projectName}</p>
                                        <p className="text-xs text-ink-faint">{project.projectKey}</p>
                                    </div>
                                    <Badge tone={project.status === "Active" ? "success" : project.status === "On Hold" ? "warning" : "accent"}>
                                        {project.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                    <h3 className="mb-4 font-display text-base font-semibold uppercase text-ink">Recent Activity</h3>
                    {recentActivity.length === 0 ? (
                        <p className="text-sm text-ink-faint">No recent activity yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity.map((notification) => (
                                <div key={notification._id} className="flex items-center gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                                    <img src={notification.sender?.profileImage} className="h-8 w-8 rounded-full object-cover" alt="" />
                                    <p className="text-sm text-ink-muted">{notification.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </motion.div>

            <ImageLightbox
                src={user?.profileImage}
                alt={user?.username}
                open={dpOpen}
                onClose={() => setDpOpen(false)}
            />
        </div>
    )
}

export default ProfilePage
