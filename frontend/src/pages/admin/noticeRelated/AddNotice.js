import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, TextField, Button, Container, Box, Typography, Grid, Tooltip, IconButton, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Popup from '../../../components/Popup';

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector(state => state.user);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState([]);
  const adminID = currentUser._id;

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const fields = new FormData();
  fields.append('title', title);
  fields.append('details', details);
  fields.append('date', date);
  fields.append('adminID', adminID);
  file.forEach(f => fields.append('files', f));

  const address = "Notice";

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    dispatch(addStuff(fields, address));
  };

  const removeFile = (index) => {
    setFile(file.filter((_, i) => i !== index));
  };

  const cancelHandler = () => {
    navigate('/Admin/notices');
  };

  useEffect(() => {
    if (status === 'added') {
      navigate('/Admin/notices');
      dispatch(underControl());
    } else if (status === 'error') {
      setMessage("Network Error");
      setShowPopup(true);
      setLoader(false);
    }
  }, [status, navigate, error, response, dispatch]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ p: 3, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Add New Notice
        </Typography>
        <form onSubmit={submitHandler} encType="multipart/form-data">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notice Title"
                variant="outlined"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notice Details"
                variant="outlined"
                multiline
                rows={4}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                variant="outlined"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Tooltip title="Max 5 files (for each 30MB, 150MB total). Supported file types : JPEG, PNG, GIF, PDF, MP4, AVI, MOV">
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                >
                  Select Files
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.mp4,.avi,.mov"
                    onChange={(event) => setFile([...file, ...Array.from(event.target.files)])}
                  />
                </Button>
              </Tooltip>
            </Grid>

            {file.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                  Selected Files ({file.length})
                </Typography>
                <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                  {file.map((f, index) => (
                    <Paper key={index} elevation={0} sx={{ p: 1, mb: 1, backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {f.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ({(f.size / 1024 / 1024).toFixed(2)} MB)
                        </Typography>
                      </Box>
                      <IconButton size="small" color="error" onClick={() => removeFile(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" color="secondary" onClick={cancelHandler}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit" disabled={loader}>
                {loader ? <CircularProgress size={24} color="inherit" /> : 'Add Notice'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </Container>
  );
};

export default AddNotice;