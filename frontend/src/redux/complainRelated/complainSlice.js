import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    complainsList: [],
    loading: false,
    error: null,
    response: null,
};

const complainSlice = createSlice({
    name: 'complain',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        getSuccess: (state, action) => {
            // Ensure complainsList is always an array
            state.complainsList = Array.isArray(action.payload?.data) ? action.payload.data : [];
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
        updateComplainSuccess: (state, action) => {
            const updatedComplain = action.payload;
            const index = state.complainsList.findIndex(complain => complain._id === updatedComplain._id);
            if (index !== -1) {
                state.complainsList[index] = updatedComplain;
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
    updateComplainSuccess
} = complainSlice.actions;

export const complainReducer = complainSlice.reducer;