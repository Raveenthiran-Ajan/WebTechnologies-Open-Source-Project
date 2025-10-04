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

    try {
        const url = `${REACT_APP_BASE_URL}/${address}List/${id}`;
        // Debug: log the GET URL
        // eslint-disable-next-line no-console
        console.debug('complainHandle.getAllComplains: GET', url);
        const result = await axios.get(url);
        // Debug: log server response
        // eslint-disable-next-line no-console
        console.debug('complainHandle.getAllComplains: response', result && result.data);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
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