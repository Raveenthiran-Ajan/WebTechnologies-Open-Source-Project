import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { AccountCircle, School, Group, FamilyRestroom } from '@mui/icons-material';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/userRelated/userHandle';
import Popup from '../components/Popup';
import { useTranslation } from 'react-i18next';

const ChooseUser = ({ visitor }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const password = "zxc"

  const { status: userStatus, currentUser, currentRole } = useSelector(state => state.user);
  const { status: parentStatus } = useSelector(state => state.parent);

  const [loader, setLoader] = useState(false)
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState("");

  const navigateHandler = (user) => {
    if (user === "Admin") {
      if (visitor === "guest") {
        const email = "yogendra@12"
        const fields = { email, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Adminlogin');
      }
    }

    else if (user === "Student") {
      if (visitor === "guest") {
        const rollNum = "1"
        const studentName = "Dipesh Awasthi"
        const fields = { rollNum, studentName, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Studentlogin');
      }
    }

    else if (user === "Teacher") {
      if (visitor === "guest") {
        const email = "tony@12"
        const fields = { email, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Teacherlogin');
      }
    }
    else if (user === "Parent") {
      if (visitor === "guest") {
        const email = "parent@12"
        const fields = { email, password }
        setLoader(true)
        dispatch(loginUser(fields, user))
      }
      else {
        navigate('/Parentlogin');
      }
    }
  }

  useEffect(() => {
    if (userStatus === 'success' || currentUser !== null) {
      if (currentRole === 'Admin') {
        navigate('/Admin/dashboard');
      }
      else if (currentRole === 'Student') {
        navigate('/Student/dashboard');
      } else if (currentRole === 'Teacher') {
        navigate('/Teacher/dashboard');
      } else if (currentRole === 'Parent') {
        navigate('/Parent/dashboard');
      }
    }
    else if (userStatus === 'error' || parentStatus === 'error') {
      setLoader(false)
      setMessage("Network Error")
      setShowPopup(true)
    }
  }, [userStatus, parentStatus, currentRole, navigate, currentUser]);

  const { t } = useTranslation();
  return (
    <StyledContainer>
      <Container>
        <TitleSection>
          <StyledTitle>{t('chooseUser.chooseUserTitle')}</StyledTitle>
          <StyledSubtitle>{t('chooseUser.chooseUserDesc')}</StyledSubtitle>
        </TitleSection>
        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={3} onClick={() => navigateHandler("Admin")}>
              <Box mb={2}>
                <AccountCircle fontSize="large" />
              </Box>
              <StyledTypography>
                {t('chooseUser.admin')}
              </StyledTypography>
              {t('chooseUser.adminDesc')}
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={3} onClick={() => navigateHandler("Teacher")}>
              <Box mb={2}>
                <Group fontSize="large" />
              </Box>
              <StyledTypography>
                {t('chooseUser.teacher')}
              </StyledTypography>
              {t('chooseUser.teacherDesc')}
            </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={3} onClick={() => navigateHandler("Student")}>
              <Box mb={2}>
                <School fontSize="large" />
              </Box>
              <StyledTypography>
                {t('chooseUser.student')}
              </StyledTypography>
              {t('chooseUser.studentDesc')}
              </StyledPaper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StyledPaper elevation={3} onClick={() => navigateHandler("Parent")}>
              <Box mb={2}>
                <FamilyRestroom fontSize="large" />
              </Box>
              <StyledTypography>
                {t('chooseUser.parent')}
              </StyledTypography>
              {t('chooseUser.parentDesc')}
            </StyledPaper>
          </Grid>
        </Grid>
      </Container>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loader}
      >
        <CircularProgress color="inherit" />
        Please Wait
      </Backdrop>
      <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
    </StyledContainer>
  );
};

export default ChooseUser;

const StyledContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.02)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.02)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.01)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.01)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.01)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
    pointer-events: none;
  }
`;

const StyledPaper = styled(Paper)`
  padding: 30px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  height: 100%;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border-radius: 20px;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
    box-shadow:
      0 20px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      0 0 60px rgba(255, 255, 255, 0.1);

    /* Scale up icons on hover */
    .MuiSvgIcon-root {
      transform: scale(1.3);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
  }

  &:active {
    transform: translateY(-4px) scale(1.01);
  }
`;

const StyledTypography = styled.h2`
  margin-bottom: 10px;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
`;

const StyledTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 1rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4));
    border-radius: 2px;
  }
`;

const StyledSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-weight: 300;
  letter-spacing: 0.5px;
`;
