import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import DashboardNavbar from "./DashboardNavbar"
import MobileNav from "./MobileNav"

const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-canvas">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <DashboardNavbar />
                <main className="flex-1 overflow-y-auto px-4 py-6 pb-20 md:px-8 md:pb-6">
                    <Outlet />
                </main>
            </div>
            <MobileNav />
        </div>
    )
}

export default DashboardLayout
