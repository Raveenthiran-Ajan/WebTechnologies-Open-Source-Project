import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    postDone,
    doneSuccess
} from './teacherSlice';
const REACT_APP_BASE_URL = "http://localhost:5000";

export const getAllTeachers = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Teachers/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getTeacherDetails = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Teacher/${id}`);
        if (result.data?.message) {
            dispatch(getFailed(result.data.message));
        } else if (result.data) {
            // Clean up any undefined or null values
            const cleanedData = {...result.data};
            if (!cleanedData.teachSubjects?.length) delete cleanedData.teachSubjects;
            if (!cleanedData.teachSclasses?.length) delete cleanedData.teachSclasses;
            if (!cleanedData.attendanceClass) delete cleanedData.attendanceClass;
            
            dispatch(doneSuccess(cleanedData));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const updateTeachSubject = (teacherId, teachSubject) => async (dispatch) => {
    dispatch(getRequest());

    try {
        await axios.put(`${REACT_APP_BASE_URL}/TeacherSubject`, { teacherId, teachSubject }, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
    } catch (error) {
        dispatch(getError(error));
    }
}

export const assignMultipleSubjects = (teacherId, subjectIds, attendanceClassId = null) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const requestData = { teacherId, subjectIds };
        if (attendanceClassId) {
            requestData.attendanceClassId = attendanceClassId;
        }
        
        const result = await axios.put(`${REACT_APP_BASE_URL}/TeacherMultipleSubjects`, requestData, {
            headers: { 'Content-Type': 'application/json' },
        });
        dispatch(postDone());
        return result.data;
    } catch (error) {
        dispatch(getError(error));
        throw error;
    }
}