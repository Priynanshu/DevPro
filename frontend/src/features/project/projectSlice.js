import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"

export const fetchProjects = createAsyncThunk("project/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/projects/all-projects")
        return data.projects
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const fetchProjectById = createAsyncThunk("project/fetchById", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/projects/project/${id}`)
        return data.project
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const createProject = createAsyncThunk("project/create", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/projects/create-project", payload)
        return data.project
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const updateProject = createAsyncThunk("project/update", async ({ id, payload }, { rejectWithValue }) => {
    try {
        const { data } = await api.put(`/projects/edit/${id}`, payload)
        return data.project
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const updateProjectIcon = createAsyncThunk("project/updateIcon", async ({ id, formData }, { rejectWithValue }) => {
    try {
        const { data } = await api.put(`/projects/icon/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        })
        return data.project
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const deleteProject = createAsyncThunk("project/delete", async (id, { rejectWithValue }) => {
    try {
        await api.delete(`/projects/delete/${id}`)
        return id
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

const projectSlice = createSlice({
    name: "project",
    initialState: {
        list: [],
        current: null,
        status: "idle",
        error: null
    },
    reducers: {
        clearCurrentProject: (state) => {
            state.current = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.status = "loading"
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.list = action.payload
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                state.current = action.payload
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.list.unshift(action.payload)
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.current = action.payload
                state.list = state.list.map((project) => project._id === action.payload._id ? action.payload : project)
            })
            .addCase(updateProjectIcon.fulfilled, (state, action) => {
                state.current = action.payload
                state.list = state.list.map((project) => project._id === action.payload._id ? action.payload : project)
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.list = state.list.filter((project) => project._id !== action.payload)
            })
    }
})

export const { clearCurrentProject } = projectSlice.actions
export default projectSlice.reducer
