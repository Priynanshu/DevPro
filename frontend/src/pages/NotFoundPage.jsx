import { Link } from "react-router-dom"
import { Button } from "../components/ui/Primitives"

const NotFoundPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 text-center">
            <p className="text-7xl font-extrabold text-accent-400">404</p>
            <h1 className="mt-4 text-2xl font-bold text-ink">Page Not Found</h1>
            <p className="mt-2 text-sm text-ink-muted">The page you're looking for doesn't exist.</p>
            <Link to="/">
                <Button className="mt-6">Back To Home</Button>
            </Link>
        </div>
    )
}

export default NotFoundPage
