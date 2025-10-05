import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    studentsList: [],
    loading: false,
    error: null,
    response: null,
    statestatus: 'idle',
    studentDetails: {},
    studentTermReport: null,
};

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        getRequest: (state) => {
            state.loading = true;
        },
        stuffDone: (state) => {
            state.loading = false;
            state.error = null;
            state.response = null;
            state.statestatus = 'added';
        },
        getSuccess: (state, action) => {
            state.studentsList = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getStudentDetails: (state, action) => {
            state.studentDetails = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getFailed: (state, action) => {
            state.response = action.payload;
            state.loading = false;
            state.statestatus = 'failed';
            state.error = null;
        },
        getError: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        underStudentControl: (state) => {
            state.loading = false;
            state.response = null;
            state.error = null;
            state.statestatus = 'idle';
        },
        clearStudentsList: (state) => {
            state.studentsList = [];
            state.loading = false;
            state.error = null;
            state.response = null;
        },
        getStudentTermReportSuccess: (state, action) => {
            state.studentTermReport = action.payload;
            state.loading = false;
            state.error = null;
            state.response = null;
        },
    },
});

export const {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    underStudentControl,
    stuffDone,
    clearStudentsList,
    getStudentDetails,
    getStudentTermReportSuccess,
} = studentSlice.actions;

export const studentReducer = studentSlice.reducer;