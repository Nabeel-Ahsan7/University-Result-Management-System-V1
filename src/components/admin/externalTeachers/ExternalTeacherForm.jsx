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
    Alert
} from '@mui/material';

const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Senior Lecturer',
    'Lecturer'
];

export default function ExternalTeacherForm({ open, onClose, onSave, teacher, editMode }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        designation: '',
        department: '',
        university_name: '',
        phone: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (teacher && editMode) {
            setFormData({
                name: teacher.name || '',
                email: teacher.email || '',
                password: '', // Don't populate password field for security
                designation: teacher.designation || '',
                department: teacher.department || '',
                university_name: teacher.university_name || '',
                phone: teacher.phone || ''
            });
        } else {
            // Reset form for new teacher
            setFormData({
                name: '',
                email: '',
                password: '',
                designation: '',
                department: '',
                university_name: '',
                phone: ''
            });
        }

        setErrors({});
        setFormError('');
    }, [teacher, editMode, open]);

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!editMode && !formData.password.trim()) newErrors.password = 'Password is required';
        if (!formData.designation) newErrors.designation = 'Designation is required';
        if (!formData.department.trim()) newErrors.department = 'Department is required';
        if (!formData.university_name.trim()) newErrors.university_name = 'University name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation (only for new teachers)
        if (!editMode && formData.password && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            // Remove password if editing and password is empty
            const submissionData = { ...formData };
            if (editMode && !submissionData.password) {
                delete submissionData.password;
            }

            const success = await onSave(submissionData);
            if (success) {
                onClose();
            }
        } catch (error) {
            setFormError('An error occurred while saving. Please try again.');
            console.error('Form submission error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {editMode ? 'Edit External Teacher' : 'Add New External Teacher'}
            </DialogTitle>

            <DialogContent dividers>
                {formError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {formError}
                    </Alert>
                )}

                <Grid container spacing={2}>
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
                            name="password"
                            label={editMode ? "Password (leave blank to keep current)" : "Password"}
                            type="password"
                            fullWidth
                            margin="normal"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password || (editMode ? 'Leave blank to keep current password' : '')}
                            disabled={loading}
                            required={!editMode}
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
                            name="phone"
                            label="Phone Number"
                            fullWidth
                            margin="normal"
                            value={formData.phone}
                            onChange={handleChange}
                            error={!!errors.phone}
                            helperText={errors.phone}
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
                            name="designation"
                            label="Designation"
                            fullWidth
                            margin="normal"
                            value={formData.designation}
                            onChange={handleChange}
                            error={!!errors.designation}
                            helperText={errors.designation}
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
                            {designations.map(designation => (
                                <MenuItem key={designation} value={designation}>
                                    {designation}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            name="university_name"
                            label="University"
                            fullWidth
                            margin="normal"
                            value={formData.university_name}
                            onChange={handleChange}
                            error={!!errors.university_name}
                            helperText={errors.university_name}
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

                    <Grid item xs={12}>
                        <TextField
                            name="department"
                            label="Department"
                            fullWidth
                            margin="normal"
                            value={formData.department}
                            onChange={handleChange}
                            error={!!errors.department}
                            helperText={errors.department}
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