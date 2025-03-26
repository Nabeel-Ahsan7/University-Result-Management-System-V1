import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Typography,
    Box,
    FormHelperText,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton
} from '@mui/material';
import { AttachFile, Close, Delete } from '@mui/icons-material';

export default function NoticeForm({
    open,
    onClose,
    onSave,
    notice,
    examCommittees,
    editMode = false
}) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        exam_committee_id: '',
        documents: []
    });

    const [existingDocuments, setExistingDocuments] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ success: false, error: null });

    // Initialize form with notice data if in edit mode
    useEffect(() => {
        if (open && notice && editMode) {
            setFormData({
                title: notice.title || '',
                description: notice.description || '',
                exam_committee_id: notice.exam_committee_id._id || '',
                documents: []
            });
            setExistingDocuments(notice.document_urls || []);
        } else if (open) {
            // Reset form when opening in create mode
            setFormData({
                title: '',
                description: '',
                exam_committee_id: '',
                documents: []
            });
            setExistingDocuments([]);
        }

        // Reset status when dialog opens
        if (open) {
            setStatus({ success: false, error: null });
            setErrors({});
        }
    }, [open, notice, editMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when field is changed
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData({
            ...formData,
            documents: [...formData.documents, ...files]
        });
    };

    const handleRemoveFile = (index) => {
        const updatedFiles = [...formData.documents];
        updatedFiles.splice(index, 1);
        setFormData({
            ...formData,
            documents: updatedFiles
        });
    };

    const handleRemoveExistingDocument = async (url) => {
        if (!editMode || !notice) return;

        try {
            setLoading(true);
            const response = await onSave({
                action: 'removeDocument',
                noticeId: notice._id,
                documentUrl: url
            });

            if (response.success) {
                setExistingDocuments(existingDocuments.filter(doc => doc !== url));
                setStatus({ success: true, error: null });
            } else {
                setStatus({ success: false, error: response.error || 'Failed to remove document' });
            }
        } catch (err) {
            setStatus({ success: false, error: err.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.exam_committee_id) newErrors.exam_committee_id = 'Please select an exam committee';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setStatus({ success: false, error: null });

            const response = await onSave({
                ...formData,
                action: editMode ? 'update' : 'create',
                noticeId: editMode ? notice._id : null
            });

            if (response.success) {
                setStatus({ success: true, error: null });
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setStatus({ success: false, error: response.error || 'Failed to save notice' });
            }
        } catch (err) {
            setStatus({ success: false, error: err.message || 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#025c53', color: 'white' }}>
                {editMode ? 'Edit Notice' : 'Create New Notice'}
            </DialogTitle>

            <DialogContent dividers>
                {status.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {status.error}
                    </Alert>
                )}

                {status.success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Notice {editMode ? 'updated' : 'created'} successfully!
                    </Alert>
                )}

                <Box sx={{ mt: 1 }}>
                    <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.exam_committee_id}>
                        <InputLabel id="committee-label">Exam Committee</InputLabel>
                        <Select
                            labelId="committee-label"
                            name="exam_committee_id"
                            value={formData.exam_committee_id}
                            onChange={handleInputChange}
                            label="Exam Committee"
                        >
                            {examCommittees.map(committee => (
                                <MenuItem key={committee._id} value={committee._id}>
                                    {committee.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.exam_committee_id && (
                            <FormHelperText>{errors.exam_committee_id}</FormHelperText>
                        )}
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        margin="normal"
                        error={!!errors.title}
                        helperText={errors.title}
                    />

                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description}
                    />

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Attach Documents
                        </Typography>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AttachFile />}
                            sx={{ mb: 2 }}
                        >
                            Upload Files
                            <input
                                type="file"
                                multiple
                                hidden
                                onChange={handleFileChange}
                                accept="image/*,.pdf,.doc,.docx"
                            />
                        </Button>

                        {/* Display selected files */}
                        {formData.documents.length > 0 && (
                            <List dense>
                                <Typography variant="subtitle2" gutterBottom>
                                    New Files
                                </Typography>
                                {formData.documents.map((file, index) => (
                                    <ListItem
                                        key={`new-${index}`}
                                        secondaryAction={
                                            <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemIcon>
                                            <AttachFile />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={file.name}
                                            secondary={`${(file.size / 1024).toFixed(1)} KB`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        {/* Display existing documents in edit mode */}
                        {editMode && existingDocuments.length > 0 && (
                            <List dense>
                                <Typography variant="subtitle2" gutterBottom>
                                    Existing Files
                                </Typography>
                                {existingDocuments.map((url, index) => (
                                    <ListItem
                                        key={`existing-${index}`}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleRemoveExistingDocument(url)}
                                                disabled={loading}
                                            >
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemIcon>
                                            <AttachFile />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={url.split('/').pop()}
                                            secondary={
                                                <Button
                                                    size="small"
                                                    href={`http://localhost:4000${url}`}
                                                    target="_blank"
                                                >
                                                    View
                                                </Button>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                    sx={{ bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                >
                    {loading ? 'Saving...' : editMode ? 'Update Notice' : 'Create Notice'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}