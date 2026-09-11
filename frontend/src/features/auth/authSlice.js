import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import api from "../../api/axios"

export const registerUser = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/register", payload)
        return data.userData
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const loginUser = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.post("/auth/login", payload)
        return data.userData
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const fetchCurrentUser = createAsyncThunk("auth/getMe", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get("/auth/getMe")
        return data.userData
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

export const logoutUser = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
    try {
        await api.post("/auth/logout")
        return true
    } catch (error) {
        return rejectWithValue(error.message)
    }
})

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        status: "idle",
        checkingSession: true,
        error: null
    },
    reducers: {
        clearAuthError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(loginUser.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.checkingSession = true
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload
                state.checkingSession = false
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.user = null
                state.checkingSession = false
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
            })
    }
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
