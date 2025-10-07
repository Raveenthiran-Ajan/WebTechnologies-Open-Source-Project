import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    leaveRequestsList: [],
    loading: false,
    error: null,
    response: null,
};

const leaveRequestSlice = createSlice({
    name: 'leaveRequest',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getSuccess: (state, action) => {
            state.leaveRequestsList = Array.isArray(action.payload?.data) ? action.payload.data : [];
            state.loading = false;
            state.error = null;
            state.response = action.payload?.message || null;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        updateLeaveRequestSuccess: (state, action) => {
            const updatedRequest = action.payload;
            const index = state.leaveRequestsList.findIndex(request => request._id === updatedRequest._id);
            if (index !== -1) {
                state.leaveRequestsList[index] = updatedRequest;
            }
            state.loading = false;
            state.error = null;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    updateLeaveRequestSuccess
} = leaveRequestSlice.actions;

export const leaveRequestReducer = leaveRequestSlice.reducer;