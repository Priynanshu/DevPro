import { useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Toaster } from "react-hot-toast"
import { fetchCurrentUser } from "./features/auth/authSlice"

import LandingPage from "./pages/LandingPage"
import AboutPage from "./pages/AboutPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import NotFoundPage from "./pages/NotFoundPage"

import DashboardLayout from "./components/layout/DashboardLayout"
import DashboardOverview from "./pages/DashboardOverview"
import ProjectsPage from "./pages/ProjectsPage"
import ProjectDetailPage from "./pages/ProjectDetailPage"
import TeamPage from "./pages/TeamPage"
import MyTasksPage from "./pages/MyTasksPage"
import MemberProfilePage from "./pages/MemberProfilePage"
import NotificationsPage from "./pages/NotificationsPage"
import ProfilePage from "./pages/ProfilePage"
import InviteResultPage from "./pages/InviteResultPage"
import ProtectedRoute from "./routes/ProtectedRoute"

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invite-result" element={<InviteResultPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/:id/team" element={<TeamPage />} />
            <Route path="my-tasks" element={<MyTasksPage />} />
            <Route path="users/:id" element={<MemberProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App
