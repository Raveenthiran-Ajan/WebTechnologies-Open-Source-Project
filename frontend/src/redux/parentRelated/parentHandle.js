import axios from 'axios';
import { getRequest, getError, authSuccess, getChildDetailsSuccess, stuffDone, getParentsList, getFailed, getParentDetailsSuccess, parentUpdated, getDeleteSuccess } from './parentSlice';

const REACT_APP_BASE_URL = "http://localhost:5000";

export const parentLogIn = (fields) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.post(`${REACT_APP_BASE_URL}/ParentLogin`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.children) {
            dispatch(authSuccess(result.data));
            localStorage.setItem('parent', JSON.stringify(result.data));
        } else {
            dispatch(getError(result.data.message));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};

export const deleteParent = (id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.delete(`${REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getDeleteSuccess());
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const getChildDetails = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Parent/Child/${id}`);
        if (result.data) {
            dispatch(getChildDetailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};

export const addParent = (fields, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.post(`${REACT_APP_BASE_URL}/${address}Reg`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getError(result.data.message));
        } else {
            dispatch(stuffDone(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};
export const getAllParents = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Parents/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getParentsList(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
};

export const getParentDetails = (id) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/Parent/${id}`);
        if (result.data) {
            dispatch(getParentDetailsSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};

export const updateParent = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/Parent/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getError(result.data.message));
        } else {
            dispatch(parentUpdated(result.data));
        }
    } catch (error) {
        dispatch(getError(error.message));
    }
};