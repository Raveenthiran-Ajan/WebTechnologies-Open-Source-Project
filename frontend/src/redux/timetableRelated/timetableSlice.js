import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	timetable: null,
	loading: false,
	error: null,
	response: null,
};

const timetableSlice = createSlice({
	name: 'timetable',
	initialState,
	reducers: {
		getRequest: (state) => { state.loading = true; },
		getSuccess: (state, action) => { state.timetable = action.payload; state.loading = false; state.error = null; state.response = null; },
		getFailed: (state, action) => { state.response = action.payload; state.loading = false; state.error = null; },
		getError: (state, action) => { state.loading = false; state.error = action.payload; },
	},
});

export const { getRequest, getSuccess, getFailed, getError } = timetableSlice.actions;
export const timetableReducer = timetableSlice.reducer;






