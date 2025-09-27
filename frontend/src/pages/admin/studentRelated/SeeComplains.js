import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Box, Chip, Button, Alert
} from '@mui/material';
import axios from 'axios';
import { getAllComplains } from '../../../redux/complainRelated/complainHandle';
import TableTemplate from '../../../components/TableTemplate';

const SeeComplains = () => {
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);
  const [message, setMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');

  useEffect(() => {
    dispatch(getAllComplains(currentUser._id, "Complain"));
  }, [currentUser._id, dispatch]);

  if (error) {
    console.log(error);
  }

  const handleStatusUpdate = async (complainId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Actioned' : 'Pending';
      
      await axios.put(`${process.env.REACT_APP_BASE_URL}/ComplainUpdate/${complainId}`, {
        status: newStatus,
        actionedBy: currentUser._id
      });

      setMessage(`Complaint marked as ${newStatus.toLowerCase()}`);
      setAlertSeverity('success');
      
      // Refresh complaints list
      dispatch(getAllComplains(currentUser._id, "Complain"));
    } catch (error) {
      setMessage('Error updating complaint status');
      setAlertSeverity('error');
      console.error('Error updating complaint:', error);
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
        >
          {status === 'Pending' ? 'Mark Actioned' : 'Mark Pending'}
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