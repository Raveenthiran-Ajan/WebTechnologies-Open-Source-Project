import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Box, Chip, Button, Alert, Typography, CircularProgress
} from '@mui/material';
import { getAllComplains, updateComplaint } from '../../../redux/complainRelated/complainHandle';
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport
} from '@mui/x-data-grid';

const SeeComplains = () => {
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);
  const [message, setMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [updatingComplaint, setUpdatingComplaint] = useState(null);

  useEffect(() => {
    // Fetch complaints. Use currentUser._id (original behavior) but guard for presence
    if (currentUser && currentUser._id) {
      // Debug: log currentUser and id used to fetch complaints
      try {
        // eslint-disable-next-line no-console
        console.debug('SeeComplains: currentUser=', currentUser);
        // eslint-disable-next-line no-console
        console.debug('SeeComplains: fetching ComplainList for id=', currentUser._id);
      } catch (e) {}
      dispatch(getAllComplains(currentUser._id, "Complain"));
    }
  }, [currentUser, dispatch]);

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
    { field: 'user', headerName: 'User Type', width: 150 },
    { field: 'complaint', headerName: 'Complaint', width: 300 },
    { field: 'date', headerName: 'Date', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Actioned' ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => {
        const status = params.row.status;
        const complainId = params.row.id;
        
        return (
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
        );
      },
    },
  ];

  const complainRows = complainsList && complainsList.length > 0 ? complainsList.map((complain) => {
    const date = new Date(complain.date);
    const dateString = date.toString() !== "Invalid Date" ? date.toISOString().substring(0, 10) : "Invalid Date";
    
    const userTypeDisplay = complain.userType 
      ? complain.userType.charAt(0).toUpperCase() + complain.userType.slice(1)
      : "User";
    
    return {
      id: complain._id,
      user: userTypeDisplay,
      complaint: complain.complaint,
      date: dateString,
      status: complain.status || 'Pending',
    };
  }) : [];

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </GridToolbarContainer>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

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
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
          All Complaints
        </Typography>
        {response ?
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
            <Typography variant="h6" gutterBottom>
              No complaints found
            </Typography>
          </Box>
          :
          (Array.isArray(complainsList) && complainsList.length > 0 ?
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid 
              rows={complainRows || []} 
              columns={complainColumns} 
              components={{ Toolbar: CustomToolbar }}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </Box>
          :
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
            <Typography variant="h6" gutterBottom>
              No complaints found
            </Typography>
          </Box>
          )
        }
      </Paper>
    </>
  );
};

export default SeeComplains;