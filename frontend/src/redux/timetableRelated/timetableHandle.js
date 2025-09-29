import axios from 'axios';
import { getRequest, getSuccess, getFailed, getError } from './timetableSlice';

const BASE_URL = "http://localhost:5000";

export const fetchTimetable = (classId) => async (dispatch) => {
	dispatch(getRequest());
	try {
		const res = await axios.get(`${BASE_URL}/Timetable/${classId}`);
		if (res.data?.message) return dispatch(getFailed(res.data.message));
		dispatch(getSuccess(res.data));
	} catch (e) {
		dispatch(getError(e));
	}
}

export const saveTimetable = (payload) => async (dispatch) => {
	dispatch(getRequest());
	try {
		const res = await axios.post(`${BASE_URL}/Timetable`, payload);
		if (res.data?.message) return dispatch(getFailed(res.data.message));
		dispatch(getSuccess(res.data));
	} catch (e) {
		dispatch(getError(e));
	}
}






