import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Paper
} from '@mui/material';
import { AttachFile, InsertDriveFile, PictureAsPdf } from '@mui/icons-material';

export default function ViewNoticeDialog({ open, onClose, notice }) {
    if (!notice) return null;

    const getFileIcon = (url) => {
        if (url.endsWith('.pdf')) return <PictureAsPdf color="error" />;
        if (url.match(/\.(jpeg|jpg|png|gif)$/i)) return <InsertDriveFile color="primary" />;
        return <AttachFile />;
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#025c53', color: 'white' }}>
                Notice Details
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                        {notice.title}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        <Chip
                            label={notice.exam_committee_id.name}
                            color="primary"
                            size="small"
                            sx={{ bgcolor: '#025c53' }}
                        />
                        <Chip
                            label={`Department: ${notice.exam_committee_id.department_id?.name}`}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            label={`Session: ${notice.exam_committee_id.session_id?.name}`}
                            size="small"
                            variant="outlined"
                        />
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        Posted: {formatDate(notice.createdAt)}
                        {notice.updatedAt !== notice.createdAt &&
                            ` (Updated: ${formatDate(notice.updatedAt)})`}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    Description
                </Typography>
                <Paper elevation={0} sx={{ bgcolor: '#f9f9f9', p: 2, mb: 3 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {notice.description}
                    </Typography>
                </Paper>

                {notice.document_urls && notice.document_urls.length > 0 && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Attachments ({notice.document_urls.length})
                        </Typography>
                        <List>
                            {notice.document_urls.map((url, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        {getFileIcon(url)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={url.split('/').pop()}
                                    />
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        href={`http://localhost:4000${url}`}
                                        target="_blank"
                                        sx={{ ml: 2 }}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        href={`http://localhost:4000${url}`}
                                        download
                                        sx={{ ml: 1, bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                                    >
                                        Download
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}