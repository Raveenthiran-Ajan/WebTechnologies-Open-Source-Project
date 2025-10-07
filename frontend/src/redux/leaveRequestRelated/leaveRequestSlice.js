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
            // Handle both old array format and new object format {pending: [], processed: []}
            const data = action.payload?.data;
            if (data && typeof data === 'object' && (data.pending || data.processed)) {
                state.leaveRequestsList = data;
            } else if (Array.isArray(data)) {
                state.leaveRequestsList = data;
            } else {
                state.leaveRequestsList = [];
            }
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
            // Handle both array format and object format {pending: [], processed: []}
            if (Array.isArray(state.leaveRequestsList)) {
                // Old array format
                const index = state.leaveRequestsList.findIndex(request => request._id === updatedRequest._id);
                if (index !== -1) {
                    state.leaveRequestsList[index] = updatedRequest;
                }
            } else if (state.leaveRequestsList && typeof state.leaveRequestsList === 'object') {
                // New object format - remove from pending and add to processed
                const pendingIndex = state.leaveRequestsList.pending?.findIndex(request => request._id === updatedRequest._id);
                if (pendingIndex !== -1) {
                    state.leaveRequestsList.pending.splice(pendingIndex, 1);
                    if (!state.leaveRequestsList.processed) state.leaveRequestsList.processed = [];
                    state.leaveRequestsList.processed.unshift(updatedRequest);
                } else {
                    // If not in pending, update in processed
                    const processedIndex = state.leaveRequestsList.processed?.findIndex(request => request._id === updatedRequest._id);
                    if (processedIndex !== -1) {
                        state.leaveRequestsList.processed[processedIndex] = updatedRequest;
                    }
                }
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