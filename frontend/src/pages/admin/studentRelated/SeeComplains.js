import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Paper, Box, Chip, Button, Alert, Typography, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, Badge
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';

const SeeComplains = () => {
  const dispatch = useDispatch();
  const { complainsList, loading, error, response } = useSelector((state) => state.complain);
  const { currentUser } = useSelector(state => state.user);
  const [message, setMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [updatingComplaint, setUpdatingComplaint] = useState(null);
  const [viewing, setViewing] = useState(null);


  useEffect(() => {
    // Fetch complaints. The backend expects the school id in the route (ComplainList/:schoolId).
    // Try to use currentUser.school._id when available, otherwise fall back to currentUser._id.
    if (currentUser) {
      let fetchId = null;
      if (currentUser.school) {
        // school can be an object or a string id
        fetchId = typeof currentUser.school === 'string' ? currentUser.school : (currentUser.school._id || currentUser.school);
      } else {
        fetchId = currentUser._id;
      }

      if (fetchId) {
        try {
          // eslint-disable-next-line no-console
          console.debug('SeeComplains: currentUser=', currentUser);
          // eslint-disable-next-line no-console
          console.debug('SeeComplains: fetching ComplainList for id=', fetchId);
        } catch (e) {}
        dispatch(getAllComplains(fetchId, "Complain"));
      }
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    // Log complaints when they arrive so we can verify title/description exist
    try {
      // eslint-disable-next-line no-console
      console.debug('SeeComplains: complainsList length=', Array.isArray(complainsList) ? complainsList.length : 0);
      if (Array.isArray(complainsList) && complainsList.length > 0) {
        // eslint-disable-next-line no-console
        console.debug('SeeComplains: first complain=', complainsList[0]);
      }
    } catch (e) {}
  }, [complainsList]);

  useEffect(() => {
    if (Array.isArray(complainsList)) {
      const hasPending = complainsList.some(complain => complain.status === 'Pending');
      const sidebarLink = document.querySelector('#sidebar-complain-link');
      if (sidebarLink) {
        sidebarLink.setAttribute('data-has-pending', hasPending);
      }
    }
  }, [complainsList]);

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
    { field: 'date', headerName: 'Submitted Date', width: 150 },
    { field: 'title', headerName: 'Title', width: 300, flex: 1 },
    { field: 'description', headerName: 'Description', width: 300, renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          startIcon={<VisibilityIcon />}
          onClick={() => setViewing(params.row)}
        >
          View
        </Button>
      ) },
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
      width: 220,
      renderCell: (params) => {
        const status = params.row.status;
        const complainId = params.row.id;
        
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
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
      title: complain.title || complain.complaint || 'No title',
      description: complain.description || complain.complaint || '',
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
      {/* View Dialog */}
      <Dialog open={!!viewing} onClose={() => setViewing(null)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: '1px solid #e0e0e0',
            background: 'linear-gradient(to right, #1976d2, #2196f3)',
            color: 'white',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Complaint Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {viewing && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                  <Chip
                    label={viewing.status || 'Pending'}
                    size="small"
                    color={viewing.status === 'Actioned' ? 'success' : 'warning'}
                    variant="filled"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Date Submitted</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {new Date(viewing.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Title</Typography>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 500, color: '#1976d2' }}>
                  {viewing.title}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                <Paper 
                  elevation={0}
                  sx={{
                    mt: 1,
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      color: '#2c3e50',
                      lineHeight: 1.6
                    }}
                  >
                    {viewing.description || viewing.complaint}
                  </Typography>
                </Paper>
              </Grid>
              {viewing.status === 'Actioned' && viewing.actionedDate && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Actioned Date</Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {new Date(viewing.actionedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    color={viewing.status === 'Pending' ? 'success' : 'warning'}
                    onClick={() => {
                      handleStatusUpdate(viewing.id, viewing.status);
                      setViewing(null); // Close the dialog after marking
                    }}
                  >
                    {viewing.status === 'Pending' ? 'Mark Actioned' : 'Mark Pending'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
          <Button 
            variant="contained" 
            onClick={() => setViewing(null)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SeeComplains;