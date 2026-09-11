import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"

export const fetchTasksByProject = createAsyncThunk("task/fetchByProject", async ({ projectId, filters }, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/tasks/project/${projectId}/all`, { params: filters })
        return data.tasks
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const createTask = createAsyncThunk("task/create", async ({ projectId, payload }, { rejectWithValue }) => {
    try {
        const { data } = await api.post(`/tasks/project/${projectId}/create`, payload)
        return data.task
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const updateTask = createAsyncThunk("task/update", async ({ id, payload }, { rejectWithValue }) => {
    try {
        const { data } = await api.put(`/tasks/edit/${id}`, payload)
        return data.task
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const deleteTask = createAsyncThunk("task/delete", async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/tasks/delete/${id}`)
        return id
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

const taskSlice = createSlice({
    name: "task",
    initialState: {
        list: [],
        status: "idle",
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasksByProject.pending, (state) => {
                state.status = "loading"
            })
            .addCase(fetchTasksByProject.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.list = action.payload
            })
            .addCase(fetchTasksByProject.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.list.unshift(action.payload)
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.list = state.list.map((task) => task._id === action.payload._id ? action.payload : task)
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.list = state.list.filter((task) => task._id !== action.payload)
            })
    }
})

export default taskSlice.reducer
