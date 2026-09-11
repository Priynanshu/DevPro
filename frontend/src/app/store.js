import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/authSlice"
import projectReducer from "../features/project/projectSlice"
import taskReducer from "../features/task/taskSlice"
import notificationReducer from "../features/notification/notificationSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        project: projectReducer,
        task: taskReducer,
        notification: notificationReducer
    }
})
