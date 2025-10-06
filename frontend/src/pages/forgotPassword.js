import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../redux/userRelated/userHandle';
import { useParams } from 'react-router-dom';
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

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { userRole } = useParams();
    const { t } = useTranslation();

    const { status, error } = useSelector(state => state.user);

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("")
        dispatch(forgotPassword(userRole, { email, role: userRole }));
    };

    useEffect(() => {
        if (status === 'added') {
            setMessage(true);
            dispatch(stuffAdded());
        }
    }, [status, dispatch]);

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
                    {t('forgotPassword.title')}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label={t('forgotPassword.emailLabel')}
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={status === 'loading'}
                    >
                        {status === 'loading' ? t('forgotPassword.sending') : t('forgotPassword.sendButton')}
                    </Button>
                    {message && (
                        <Typography color="green" align="center">
                            {t('forgotPassword.successMessage')}
                        </Typography>
                    )}
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

export default ForgotPassword;