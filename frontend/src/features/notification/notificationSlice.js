import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"

export const fetchNotifications = createAsyncThunk("notification/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/notifications/all")
        return data
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const markNotificationRead = createAsyncThunk("notification/markRead", async (id, { rejectWithValue }) => {
    try {
        await api.put(`/notifications/read/${id}`)
        return id
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const markAllNotificationsRead = createAsyncThunk("notification/markAllRead", async (_, { rejectWithValue }) => {
    try {
        await api.put("/notifications/read-all")
        return true
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const deleteNotification = createAsyncThunk("notification/delete", async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/notifications/delete/${id}`)
        return id
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

const notificationSlice = createSlice({
    name: "notification",
    initialState: {
        list: [],
        unreadCount: 0,
        status: "idle"
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.list = action.payload.notifications
                state.unreadCount = action.payload.unreadCount
                state.status = "succeeded"
            })
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const notification = state.list.find((item) => item._id === action.payload)
                if (notification && !notification.isRead) {
                    notification.isRead = true
                    state.unreadCount = Math.max(0, state.unreadCount - 1)
                }
            })
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                state.list = state.list.map((item) => ({ ...item, isRead: true }))
                state.unreadCount = 0
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notification = state.list.find((item) => item._id === action.payload)
                if (notification && !notification.isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1)
                }
                state.list = state.list.filter((item) => item._id !== action.payload)
            })
    }
})

export default notificationSlice.reducer
