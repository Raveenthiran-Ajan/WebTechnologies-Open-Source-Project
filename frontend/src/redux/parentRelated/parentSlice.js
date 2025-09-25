import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    parentsList: [],
    parentDetails: null,
    loading: false,
    error: null,
    response: null,
    status: 'idle',
};

const parentSlice = createSlice({
    name: "parent",
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        authSuccess: (state, action) => {
            state.currentParent = action.payload;
            state.loading = false;
            state.error = null;
            state.status = 'success';
        },
        getParentsList: (state, action) => {
            state.parentsList = action.payload;
            state.loading = false;
            state.error = null;
        },
        getParentDetailsSuccess: (state, action) => {
            state.parentDetails = action.payload;
            state.loading = false;
            state.error = null;
        },
        getChildDetailsSuccess: (state, action) => {
            state.childDetails = action.payload;
            state.loading = false;
            state.error = null;
        },
        stuffDone: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.error = null;
            state.status = 'success';
        },
        parentUpdated: (state, action) => {
            state.parentsList = state.parentsList.map(parent =>
                parent._id === action.payload._id ? action.payload : parent
            );
            state.response = action.payload;
            state.loading = false;
            state.error = null;
            state.status = 'updated';
        },
        getDeleteSuccess: (state) => {
            state.loading = false;
            state.error = null;
            state.status = 'deleted';
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
        underControl: (state) => {
            state.status = 'idle';
            state.response = null;
        }
    },
});

export const {
    getRequest,
    authSuccess,
    getParentsList,
    getParentDetailsSuccess,
    getChildDetailsSuccess,
    stuffDone,
    parentUpdated,
    getDeleteSuccess,
    getFailed,
    getError,
    underControl
} = parentSlice.actions;

export const parentReducer = parentSlice.reducer;