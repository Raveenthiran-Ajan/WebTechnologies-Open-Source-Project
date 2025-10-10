import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography,
    Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const DeleteConfirmDialog = ({
    open,
    onClose,
    onConfirm,
    title = "deleteConfirm.title",
    message = "deleteConfirm.message",
    messageEnd = "deleteConfirm.messageEnd",
    itemName = "",
    loading = false
}) => {
    const { t } = useTranslation();

    const handleConfirm = () => {
        onConfirm();
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="delete-confirm-dialog-title"
            aria-describedby="delete-confirm-dialog-description"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="delete-confirm-dialog-title" sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteForeverIcon color="error" />
                    <Typography variant="h6" component="span">
                        {t(title)}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="delete-confirm-dialog-description">
                    {t(message)}
                    {itemName && (
                        <Typography component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                            {" " + itemName}
                        </Typography>
                    )}
                    {t(messageEnd)}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    onClick={handleClose}
                    color="inherit"
                    disabled={loading}
                    variant="outlined"
                >
                    {t('deleteConfirm.cancel')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    color="error"
                    variant="contained"
                    disabled={loading}
                    autoFocus
                >
                    {loading ? t('deleteConfirm.deleting') : t('deleteConfirm.delete')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConfirmDialog;