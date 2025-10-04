import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    noticesList: [],
    loading: false,
    error: null,
    response: null,
};

const noticeSlice = createSlice({
    name: 'notice',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        getSuccess: (state, action) => {
            state.noticesList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
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
        REMOVE_NOTICE: (state, action) => {
            state.noticesList = state.noticesList.filter(notice => notice._id !== action.payload);
            state.loading = false;
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError
    , REMOVE_NOTICE
} = noticeSlice.actions;

export const noticeReducer = noticeSlice.reducer;