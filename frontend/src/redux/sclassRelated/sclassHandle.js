import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    getStudentsSuccess,
    getTeachersSuccess,
    getTeachersFailed,
    detailsSuccess,
    getFailedTwo,
    getSubjectsSuccess,
    getSubDetailsSuccess,
    getSubDetailsRequest
} from './sclassSlice';
const REACT_APP_BASE_URL = "http://localhost:5000";

export const getAllSclasses = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/${address}List/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Sclass/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailedTwo(result.data.message));
        } else {
            dispatch(getStudentsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(detailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSubjectList = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getTeacherFreeClassSubjects = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/FreeSubjectList/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSubjectsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getSubjectDetails = (id, address) => async (dispatch) => {
    dispatch(getSubDetailsRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data) {
            dispatch(getSubDetailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getTimetable = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Sclass/Timetable/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            // You may want to create a new action to store timetable in state
            // For now, just log or handle as needed
            console.log("Timetable data:", result.data);
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const updateTimetable = (id, timetable) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/Sclass/Timetable/${id}`, { timetable });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            // You may want to create a new action to update timetable in state
            console.log("Updated timetable:", result.data);
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getClassTeachers = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Sclass/Teachers/${id}`);
        if (result.data.message) {
            dispatch(getTeachersFailed(result.data.message));
        } else {
            dispatch(getTeachersSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}
