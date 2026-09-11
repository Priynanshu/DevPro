import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { Card, Skeleton } from "../components/ui/Primitives"
import api from "../api/axios"

const MemberProfilePage = () => {
    const { id } = useParams()
    const [member, setMember] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadMember = async () => {
            try {
                setLoading(true)
                const { data } = await api.get(`/auth/user/${id}`)
                setMember(data.userData)
            } catch (error) {
                toast.error(error.message || "Could Not Load Profile")
            } finally {
                setLoading(false)
            }
        }
        loadMember()
    }, [id])

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )
    }

    if (!member) {
        return <p className="text-sm text-ink-faint">This user could not be found.</p>
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <Link to="/dashboard/projects" className="inline-flex items-center gap-1 text-sm font-medium text-accent-400 hover:text-accent-400">
                <ArrowLeft size={16} />
                Back
            </Link>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="overflow-hidden rounded-xl border border-border bg-surface">
                    <div className="h-32 bg-gradient-to-r from-accent-400 to-accent-600">
                        {member.coverImage && <img src={member.coverImage} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="px-6 pb-6">
                        <img
                            src={member.profileImage}
                            alt={member.username}
                            className="-mt-10 h-20 w-20 rounded-full border-4 border-surface object-cover shadow"
                        />
                        <h1 className="mt-3 text-xl font-bold text-ink">{member.username}</h1>
                        <p className="text-sm text-ink-faint">{member.email}</p>
                        <p className="mt-2 text-sm text-ink-muted">{member.bio || "No bio added yet."}</p>
                        <span className="mt-3 inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-semibold capitalize text-accent-400">
                            {member.role}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default MemberProfilePage
