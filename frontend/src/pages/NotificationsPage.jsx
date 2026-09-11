import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Bell, CheckCheck, Check, X, ArrowRight, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from "../features/notification/notificationSlice"
import { Button, EmptyState, Skeleton } from "../components/ui/Primitives"
import api from "../api/axios"

const NotificationsPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { list: notifications, status, unreadCount } = useSelector((state) => state.notification)
    const [respondingId, setRespondingId] = useState(null)
    const [respondedInvites, setRespondedInvites] = useState({})

    useEffect(() => {
        dispatch(fetchNotifications())
    }, [dispatch])

    const handleInviteResponse = async (notification, action) => {
        try {
            setRespondingId(notification._id)
            const { data } = await api.post(`/invitations/respond-inapp/${notification.invitation._id || notification.invitation}`, { action })
            setRespondedInvites((prev) => ({ ...prev, [notification._id]: data.status }))
            toast.success(data.message)
            if (!notification.isRead) {
                dispatch(markNotificationRead(notification._id))
            }
        } catch (error) {
            toast.error(error.message || "Could Not Respond To Invite")
        } finally {
            setRespondingId(null)
        }
    }

    const handleView = (event, notification) => {
        event.stopPropagation()
        if (!notification.isRead) {
            dispatch(markNotificationRead(notification._id))
        }
        if (notification.project?._id && notification.task?._id) {
            navigate(`/dashboard/projects/${notification.project._id}?task=${notification.task._id}`)
        } else if (notification.project?._id) {
            navigate(`/dashboard/projects/${notification.project._id}`)
        }
    }

    const handleDelete = async (event, notificationId) => {
        event.stopPropagation()
        const result = await dispatch(deleteNotification(notificationId))
        if (deleteNotification.fulfilled.match(result)) {
            toast.success("Notification Deleted")
        } else {
            toast.error("Could Not Delete Notification")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-accent-300">Workspace // Dispatch</span>
                    <div className="flex items-center gap-3">
                        <h1 className="font-display text-2xl font-bold text-ink">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="flex items-center gap-1.5 rounded bg-accent-500/15 px-2 py-1 font-mono text-[11px] text-accent-300">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500" />
                                {unreadCount} Unread
                            </span>
                        )}
                    </div>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={() => dispatch(markAllNotificationsRead())}>
                        <CheckCheck size={16} />
                        Mark All Read
                    </Button>
                )}
            </div>

            {status === "loading" ? (
                <div className="space-y-2">
                    {[...Array(4)].map((_, index) => <Skeleton key={index} className="h-20 w-full" />)}
                </div>
            ) : notifications.length === 0 ? (
                <EmptyState icon={Bell} title="No Notifications" description="Task assignments, comments and status changes will show up here." />
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification, index) => {
                        const isInvite = notification.type === "project_invite"
                        const canView = Boolean(notification.project?._id) && !isInvite
                        const respondedStatus = respondedInvites[notification._id] || notification.invitation?.status

                        return (
                            <motion.article
                                key={notification._id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                onClick={() => !isInvite && !notification.isRead && dispatch(markNotificationRead(notification._id))}
                                className={`group relative flex flex-col gap-2 rounded p-4 shadow-sm transition-all cursor-pointer ${
                                    !notification.isRead ? "bg-surface border border-accent-500/20" : "bg-surface/60 hover:bg-surface"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="relative mt-0.5 shrink-0">
                                            <img
                                                src={notification.sender?.profileImage}
                                                className="h-9 w-9 rounded-full object-cover"
                                                alt=""
                                            />
                                            {!notification.isRead && (
                                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-canvas" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm text-ink">{notification.message}</p>
                                            <span className="font-mono text-[11px] text-ink-faint">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(event) => handleDelete(event, notification._id)}
                                        className="shrink-0 rounded p-1.5 text-ink-faint opacity-0 transition hover:bg-white/5 hover:text-critical group-hover:opacity-100"
                                        title="Dismiss"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                {isInvite && (
                                    <div className="ml-12 flex items-center gap-2">
                                        {respondedStatus === "accepted" ? (
                                            <span className="font-mono text-xs font-semibold text-success">✓ Accepted</span>
                                        ) : respondedStatus === "rejected" ? (
                                            <span className="font-mono text-xs text-ink-faint">Rejected</span>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={(event) => { event.stopPropagation(); handleInviteResponse(notification, "accept") }}
                                                    disabled={respondingId === notification._id}
                                                    className="!px-3 !py-1.5 text-xs"
                                                >
                                                    <Check size={13} />
                                                    Accept
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={(event) => { event.stopPropagation(); handleInviteResponse(notification, "reject") }}
                                                    disabled={respondingId === notification._id}
                                                    className="!px-3 !py-1.5 text-xs"
                                                >
                                                    <X size={13} />
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {canView && (
                                    <button
                                        onClick={(event) => handleView(event, notification)}
                                        className="ml-12 flex w-fit items-center gap-1 text-xs font-semibold text-accent-400 hover:text-accent-300"
                                    >
                                        View
                                        <ArrowRight size={12} />
                                    </button>
                                )}
                            </motion.article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default NotificationsPage
