import { useSearchParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, AlertTriangle, UserX } from "lucide-react"
import { Button } from "../components/ui/Primitives"

const content = {
    accepted: {
        icon: CheckCircle2,
        color: "text-emerald-500",
        title: "You've Joined The Project!",
        description: "Head to your dashboard to start collaborating."
    },
    rejected: {
        icon: XCircle,
        color: "text-ink-faint",
        title: "Invite Declined",
        description: "You won't be added to this project. No further action needed."
    },
    invalid: {
        icon: AlertTriangle,
        color: "text-orange-500",
        title: "This Invite Is No Longer Valid",
        description: "It may have expired or already been used."
    },
    "no-account": {
        icon: UserX,
        color: "text-orange-500",
        title: "Create An Account First",
        description: "We couldn't find a DevPro account with this email. Sign up using the same email, then ask for a new invite."
    }
}

const InviteResultPage = () => {
    const [searchParams] = useSearchParams()
    const status = searchParams.get("status") || "invalid"
    const config = content[status] || content.invalid
    const Icon = config.icon

    return (
        <div className="flex min-h-screen items-center justify-center bg-white/5 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center"
            >
                <Icon size={48} className={`mx-auto ${config.color}`} />
                <h1 className="mt-4 text-xl font-bold text-ink">{config.title}</h1>
                <p className="mt-2 text-sm text-ink-muted">{config.description}</p>

                <Link to={status === "no-account" ? "/register" : "/dashboard"}>
                    <Button className="mt-6">
                        {status === "no-account" ? "Create Account" : "Go To Dashboard"}
                    </Button>
                </Link>
            </motion.div>
        </div>
    )
}

export default InviteResultPage
