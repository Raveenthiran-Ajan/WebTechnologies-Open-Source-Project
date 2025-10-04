import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError
} from './noticeSlice';
import { REMOVE_NOTICE, MARK_NOTICE_READ } from './noticeSlice';
const REACT_APP_BASE_URL = "http://localhost:5000";

export const getAllNotices = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${REACT_APP_BASE_URL}/${address}List/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const deleteNotice = (id, schoolId) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await axios.delete(`${REACT_APP_BASE_URL}/Notice/${id}`);
        if (result.data.message && result.data.message.includes('successfully')) {
            dispatch(REMOVE_NOTICE(id));
        } else if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getFailed("Unexpected error occurred during deletion"));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch(getError(errorMessage));
    }
}

export const addNotice = (fields, schoolId) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.post(`${REACT_APP_BASE_URL}/NoticeCreate`, fields, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (result.data.message && result.data.message.includes('successfully')) {
            dispatch(getAllNotices(schoolId, "Notice"));
        } else if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getAllNotices(schoolId, "Notice"));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        dispatch(getError(errorMessage));
    }
}

export const markNoticeAsRead = (noticeId, userId) => async (dispatch) => {
    try {
        const result = await axios.put(`${REACT_APP_BASE_URL}/NoticeRead`, {
            noticeId,
            userId
        });
        // Update local state immediately
        dispatch(MARK_NOTICE_READ({ noticeId, userId }));
        return result.data;
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        console.error('Error marking notice as read:', errorMessage);
        throw error;
    }
}