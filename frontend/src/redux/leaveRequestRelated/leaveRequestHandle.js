import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    updateLeaveRequestSuccess
}
from './leaveRequestSlice';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

export const getAllLeaveRequests = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const url = `${REACT_APP_BASE_URL}/LeaveRequestList/${id}`;
        const result = await axios.get(url);

        if (result.data.success) {
            dispatch(getSuccess(result.data));
        } else {
            dispatch(getFailed(result.data.message));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Failed to fetch leave requests'));
    }
}

export const getLeaveRequestsByParent = (parentId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/LeaveRequestsByParent/${parentId}`);
        if (result.data.success) {
            dispatch(getSuccess(result.data));
        } else {
            dispatch(getFailed(result.data.message));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Failed to fetch leave requests'));
    }
}

export const getLeaveRequestsByTeacher = (teacherId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/LeaveRequestsByTeacher/${teacherId}`);
        if (result.data.success) {
            dispatch(getSuccess(result.data));
        } else {
            dispatch(getFailed(result.data.message));
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message || 'Failed to fetch leave requests'));
    }
}

export const updateLeaveRequest = (requestId, updateData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/LeaveRequestUpdate/${requestId}`, updateData);
        if (result.data.success) {
            dispatch(updateLeaveRequestSuccess(result.data.data));
            return result.data;
        } else {
            dispatch(getError('Failed to update leave request'));
            throw new Error('Failed to update leave request');
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
        throw error;
    }
}

export const deleteLeaveRequest = (requestId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${REACT_APP_BASE_URL}/LeaveRequestDelete/${requestId}`);
        if (result.data.success) {
            dispatch(getSuccess(result.data.data));
        } else {
            dispatch(getError('Failed to delete leave request'));
            throw new Error('Failed to delete leave request');
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
        throw error;
    }
};

export const addLeaveRequest = (formData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(`${REACT_APP_BASE_URL}/LeaveRequestCreate`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (result.data) {
            // Extract user ID from formData if it's FormData
            const userId = formData instanceof FormData ? formData.get('user') : formData.user;
            const updatedList = await axios.get(`${REACT_APP_BASE_URL}/LeaveRequestsByParent/${userId}`);
            dispatch(getSuccess(updatedList.data));
            return { success: true, message: 'Leave request added successfully' };
        }

        dispatch(getError('Failed to add leave request'));
        return { success: false, message: 'Failed to add leave request' };
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
        return { success: false, message: error.response?.data?.message || error.message };
    }
};