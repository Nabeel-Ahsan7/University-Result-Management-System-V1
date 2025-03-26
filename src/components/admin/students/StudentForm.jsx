import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    CircularProgress,
    Typography,
    Box,
    Alert,
    Card,
    CardContent
} from '@mui/material';

const studentTypes = [
    'undergraduate',
    'graduate',
    'masters',
    'phd'
];

export default function StudentForm({
    open,
    onClose,
    onSave,
    student,
    departments,
    sessions,
    editMode,
    initialPassword,
    onPasswordClose
}) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        registration_number: '',
        roll_number: '',
        department_id: '',
        type: 'undergraduate',
        admission_session_id: '',
        current_session_id: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (student && editMode) {
            setFormData({
                name: student.name || '',
                email: student.email || '',
                registration_number: student.registration_number || '',
                roll_number: student.roll_number || '',
                department_id: student.department_id?._id || student.department_id || '',
                type: student.type || 'undergraduate',
                admission_session_id: student.admission_session_id?._id || student.admission_session_id || '',
                current_session_id: student.current_session_id?._id || student.current_session_id || ''
            });
        } else {
            // Reset form for new student
            setFormData({
                name: '',
                email: '',
                registration_number: '',
                roll_number: '',
                department_id: '',
                type: 'undergraduate',
                admission_session_id: '',
                current_session_id: ''
            });
        }

        setErrors({});
        setFormError('');
    }, [student, editMode, open]);

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.registration_number.trim()) newErrors.registration_number = 'Registration number is required';
        if (!formData.roll_number.trim()) newErrors.roll_number = 'Roll number is required';
        if (!formData.department_id) newErrors.department_id = 'Department is required';
        if (!formData.type) newErrors.type = 'Student type is required';
        if (!formData.admission_session_id) newErrors.admission_session_id = 'Admission session is required';
        if (!formData.current_session_id) newErrors.current_session_id = 'Current session is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setFormError('');

        try {
            await onSave(formData);
        } catch (error) {
            setFormError('An error occurred while saving. Please try again.');
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    // If we're showing the initial password screen
    if (initialPassword) {
        return (
            <Dialog open={open} onClose={onPasswordClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: '#025c53', color: 'white' }}>
                    Student Added Successfully
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Card sx={{ mb: 3, bgcolor: '#e8f5e9', borderRadius: '8px', border: '1px solid #81c784' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>
                                Initial Password Generated
                            </Typography>
                            <Typography variant="body1">
                                Initial Password: <strong>{initialPassword}</strong>
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#2e7d32' }}>
                                Please save this password. It will not be shown again.
                            </Typography>
                        </CardContent>
                    </Card>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button
                        onClick={onPasswordClose}
                        variant="contained"
                        sx={{
                            bgcolor: '#025c53',
                            '&:hover': {
                                bgcolor: '#01413a',
                            }
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#025c53', color: 'white' }}>
                {editMode ? 'Edit Student' : 'Add New Student'}
            </DialogTitle>

            <DialogContent dividers>
                {formError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {formError}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="name"
                            label="Full Name"
                            fullWidth
                            margin="normal"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            disabled={loading}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#025c53',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#025c53',
                                },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            name="email"
                            label="Email Address"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            disabled={loading}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#025c53',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#025c53',
                                },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            name="registration_number"
                            label="Registration Number"
                            fullWidth
                            margin="normal"
                            value={formData.registration_number}
                            onChange={handleChange}
                            error={!!errors.registration_number}
                            helperText={errors.registration_number}
                            disabled={loading || editMode} // Disabled in edit mode
                            required
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#025c53',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#025c53',
                                },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            name="roll_number"
                            label="Roll Number"
                            fullWidth
                            margin="normal"
                            value={formData.roll_number}
                            onChange={handleChange}
                            error={!!errors.roll_number}
                            helperText={errors.roll_number}
                            disabled={loading}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#025c53',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#025c53',
                                },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            name="department_id"
                            label="Department"
                            fullWidth
                            margin="normal"
                            value={formData.department_id}
                            onChange={handleChange}
                            error={!!errors.department_id}
                            helperText={errors.department_id}
                            disabled={loading}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#025c53',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#025c53',
                                },
                            }}
                        >
                            <MenuItem value="">Select Department</MenuItem>
                            {departments.map(department => (
                                <MenuItem key={department._id} value={department._id}>
                                    {department.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            name="type"
                            label="Student Type"
                            fullWidth
                            margin="normal"
                            value={formData.type}
                            onChange={handleChange}
                            error={!!errors.type}
                            helperText={errors.type}
                            disabled={loading}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#025c53',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#025c53',
                                },
                            }}
                        >
                            {studentTypes.map(type => (
                                <MenuItem key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            name="admission_session_id"
                            label="Admission Session"
                            fullWidth
                            margin="normal"
                            value={formData.admission_session_id}
                            onChange={handleChange}
                            error={!!errors.admission_session_id}
                            helperText={errors.admission_session_id}
                            disabled={loading}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#025c53',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#025c53',
                                },
                            }}
                        >
                            <MenuItem value="">Select Session</MenuItem>
                            {sessions.map(session => (
                                <MenuItem key={session._id} value={session._id}>
                                    {session.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            name="current_session_id"
                            label="Current Session"
                            fullWidth
                            margin="normal"
                            value={formData.current_session_id}
                            onChange={handleChange}
                            error={!!errors.current_session_id}
                            helperText={errors.current_session_id}
                            disabled={loading}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#025c53',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: '#025c53',
                                },
                            }}
                        >
                            <MenuItem value="">Select Session</MenuItem>
                            {sessions.map(session => (
                                <MenuItem key={session._id} value={session._id}>
                                    {session.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {!editMode && (
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                                Note: Password will be automatically generated as "registration_number_name" (with spaces replaced by underscores).
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{ color: 'text.secondary' }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    sx={{
                        bgcolor: '#025c53',
                        '&:hover': {
                            bgcolor: '#01413a',
                        }
                    }}
                >
                    {loading ? 'Saving...' : editMode ? 'Update' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}