import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone,
    getStudentDetails
} from './studentSlice';
const REACT_APP_BASE_URL = "http://localhost:5000";

export const getAllStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const updateStudentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getStudentDetails(result.data));
            dispatch(stuffDone()); // Keep this to trigger the success message
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const removeStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const updateStudentTermMarks = (id, fields) => async (dispatch) => {
    dispatch(getRequest());

    try {
        // Using the same endpoint, but the backend logic is updated to handle bulk
        const result = await axios.post(`${REACT_APP_BASE_URL}/Students/addTermMarks/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getStudentDetails(result.data));
            dispatch(stuffDone()); // Keep this to trigger the success message
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

export const getStudentTermReport = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Student/termReport/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch({ type: 'student/getStudentTermReportSuccess', payload: result.data });
        }
    } catch (error) {
        dispatch(getError(error));
    }
};