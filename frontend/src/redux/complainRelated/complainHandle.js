import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    updateComplainSuccess
} 
from './complainSlice';

const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

export const getAllComplains = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    console.log('Starting complaint fetch:', { id, address });

    try {
        const url = `${REACT_APP_BASE_URL}/${address}List/${id}`;
        console.log('API request:', { method: 'GET', url });
        
        const result = await axios.get(url);
        console.log('API response:', {
            status: result.status,
            data: result.data
        });

        // Handle the standardized response format
        if (result.data.success) {
            dispatch(getSuccess(result.data)); // Will contain data array and message
        } else {
            console.warn('Request unsuccessful:', result.data.message);
            dispatch(getFailed(result.data.message));
        }
    } catch (error) {
        console.error('API error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        dispatch(getError(error.response?.data?.message || error.message || 'Failed to fetch complaints'));
    }
}

export const updateComplaint = (complainId, updateData) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/ComplainUpdate/${complainId}`, updateData);
        if (result.data.success) {
            dispatch(updateComplainSuccess(result.data.data));
            return result.data;
        } else {
            dispatch(getError('Failed to update complaint'));
            throw new Error('Failed to update complaint');
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
        throw error;
    }
}

export const deleteComplaint = (complainId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.delete(`${REACT_APP_BASE_URL}/ComplainDelete/${complainId}`);
        if (result.data.success) {
            // Dispatch an action to remove the complaint from the state
            dispatch(getSuccess(result.data.data));
        } else {
            dispatch(getError('Failed to delete complaint'));
            throw new Error('Failed to delete complaint');
        }
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
        throw error;
    }
};

export const addComplaint = (fields) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(`${REACT_APP_BASE_URL}/ComplainAdd`, fields);
        if (result.data.success) {
            // Get the updated list after adding
            const updatedList = await axios.get(`${REACT_APP_BASE_URL}/ComplainList/${fields.school}`);
            if (updatedList.data.success) {
                dispatch(getSuccess(updatedList.data));
                return { success: true, message: 'Complaint added successfully' };
            }
        }
        dispatch(getError('Failed to add complaint'));
        return { success: false, message: 'Failed to add complaint' };
    } catch (error) {
        dispatch(getError(error.response?.data?.message || error.message));
        return { success: false, message: error.response?.data?.message || error.message };
    }
};