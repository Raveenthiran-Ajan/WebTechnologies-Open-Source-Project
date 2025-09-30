import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Box, Chip, Button, Alert
} from '@mui/material';
import { getAllComplains, updateComplaint } from '../../../redux/complainRelated/complainHandle';
import TableTemplate from '../../../components/TableTemplate';

const SeeComplains = () => {
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);
  const [message, setMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [updatingComplaint, setUpdatingComplaint] = useState(null);

  useEffect(() => {
    dispatch(getAllComplains(currentUser._id, "Complain"));
  }, [currentUser._id, dispatch]);

  if (error) {
    console.log(error);
  }

  const handleStatusUpdate = async (complainId, currentStatus) => {
    setUpdatingComplaint(complainId);
    try {
      const newStatus = currentStatus === 'Pending' ? 'Actioned' : 'Pending';
      
      const response = await dispatch(updateComplaint(complainId, {
        status: newStatus,
        actionedBy: currentUser._id
      }));

      // Check for successful response
      if (response.success) {
        setMessage(response.message || `Complaint marked as ${newStatus.toLowerCase()}`);
        setAlertSeverity('success');
        
        // No need to refresh complaints list as Redux state is already updated
      } else {
        setMessage('Unexpected response from server');
        setAlertSeverity('warning');
      }
    } catch (error) {
      console.error('Error updating complaint:', error);
      
      let errorMessage = 'Error updating complaint status';
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        if (status === 404) {
          errorMessage = 'Complaint not found';
        } else if (status === 400) {
          errorMessage = data.message || 'Invalid request';
        } else if (status === 500) {
          errorMessage = 'Server error occurred';
        } else {
          errorMessage = data.message || `Error ${status}: Failed to update complaint`;
        }
      } else if (error.request) {
        errorMessage = 'Network error: Unable to connect to server';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      setMessage(errorMessage);
      setAlertSeverity('error');
    } finally {
      setUpdatingComplaint(null);
    }
  };

  const complainColumns = [
    { id: 'user', label: 'User', minWidth: 170 },
    { id: 'complaint', label: 'Complaint', minWidth: 200 },
    { id: 'date', label: 'Date', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 120 },
  ];

  const complainRows = complainsList && complainsList.length > 0 && complainsList.map((complain) => {
    const date = new Date(complain.date);
    const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
    
    // Capitalize first letter of userType for display
    const userTypeDisplay = complain.userType 
      ? complain.userType.charAt(0).toUpperCase() + complain.userType.slice(1)
      : "User";
    
    return {
      user: userTypeDisplay,
      complaint: complain.complaint,
      date: dateString,
      status: complain.status || 'Pending',
      id: complain._id,
      complainData: complain, // Store full complaint data for actions
    };
  });

  const ComplainButtonHaver = ({ row }) => {
    const status = row.status;
    const complainId = row.id;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
          label={status} 
          color={status === 'Actioned' ? 'success' : 'warning'}
          size="small"
        />
        <Button
          size="small"
          variant="outlined"
          color={status === 'Pending' ? 'success' : 'warning'}
          onClick={() => handleStatusUpdate(complainId, status)}
          disabled={updatingComplaint === complainId}
        >
          {updatingComplaint === complainId 
            ? 'Updating...' 
            : (status === 'Pending' ? 'Mark Actioned' : 'Mark Pending')
          }
        </Button>
      </Box>
    );
  };

  return (
    <>
      {message && (
        <Alert 
          severity={alertSeverity} 
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}
      
      {loading ?
        <div>Loading...</div>
        :
        <>
          {response ?
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              No Complains Right Now
            </Box>
            :
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              {Array.isArray(complainsList) && complainsList.length > 0 &&
                <TableTemplate buttonHaver={ComplainButtonHaver} columns={complainColumns} rows={complainRows} />
              }
            </Paper>
          }
        </>
      }
    </>
  );
};

export default SeeComplains;