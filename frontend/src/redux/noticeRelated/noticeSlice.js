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
        },
        MARK_NOTICE_READ: (state, action) => {
            const { noticeId, userId } = action.payload;
            const notice = state.noticesList.find(n => n._id === noticeId);
            if (notice && !notice.readBy?.includes(userId)) {
                notice.readBy = [...(notice.readBy || []), userId];
            }
        }
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError
    , REMOVE_NOTICE,
    MARK_NOTICE_READ
} = noticeSlice.actions;

export const noticeReducer = noticeSlice.reducer;