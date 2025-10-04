import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userRelated/userHandle';
import { underControl } from '../../../redux/userRelated/userSlice';
import { CircularProgress, TextField, Button, Container, Box, Typography, Grid } from '@mui/material';
import Popup from '../../../components/Popup';

const AddNotice = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, response, error } = useSelector(state => state.user);
  const { currentUser } = useSelector(state => state.user);

  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);
  const adminID = currentUser._id;

  const [loader, setLoader] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const fields = new FormData();
  fields.append('title', title);
  fields.append('details', details);
  fields.append('date', date);
  fields.append('adminID', adminID);
  if (file) fields.append('file', file);

  const address = "Notice";

  const submitHandler = (event) => {
    event.preventDefault();
    setLoader(true);
    dispatch(addStuff(fields, address));
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
              <Button
                variant="contained"
                component="label"
                color="primary"
              >
                Upload File
                <input
                  type="file"
                  hidden
                  onChange={(event) => setFile(event.target.files[0])}
                />
              </Button>
              {file && <Typography variant="body2" sx={{ mt: 1 }}>{file.name}</Typography>}
            </Grid>
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