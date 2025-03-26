import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { Warning } from '@mui/icons-material';

export default function DeleteNoticeDialog({ open, onClose, notice, onDelete }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await onDelete(notice._id);

            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'Failed to delete notice');
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!notice) return null;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ bgcolor: '#d32f2f', color: 'white' }}>
                Confirm Deletion
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Typography variant="body1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning sx={{ color: 'warning.main', mr: 1 }} />
                    Are you sure you want to delete this notice?
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Title: {notice.title}
                </Typography>

                <Typography variant="body2" gutterBottom>
                    Committee: {notice.exam_committee_id.name}
                </Typography>

                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    This action cannot be undone. All associated documents will also be deleted.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleDelete}
                    color="error"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}