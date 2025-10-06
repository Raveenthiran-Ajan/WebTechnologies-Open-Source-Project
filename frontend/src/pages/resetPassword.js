import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../redux/userRelated/userHandle';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Avatar,
    Box,
    Button,
    Container,
    CssBaseline,
    TextField,
    Typography
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { stuffAdded } from '../redux/userRelated/userSlice';

const ResetPassword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userRole, token } = useParams();
    const { t } = useTranslation();

    const { status, error } = useSelector(state => state.user);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert(t('resetPassword.passwordMismatch'));
            return;
        }
        dispatch(resetPassword(userRole, token, { password }));
    };

    useEffect(() => {
        if (status === 'added') {
            alert(t('resetPassword.successMessage'));
            navigate(`/${userRole}login`);
            dispatch(stuffAdded());
        }
    }, [status, navigate, userRole, dispatch]);

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    {t('resetPassword.title')}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={t('resetPassword.newPasswordLabel')}
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label={t('resetPassword.confirmPasswordLabel')}
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? t('resetPassword.resetting') : t('resetPassword.resetButton')}
                    </Button>
                    {error && (
                        <Typography color="error" align="center">
                            {error}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default ResetPassword;