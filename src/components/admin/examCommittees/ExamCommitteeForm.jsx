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
    FormControl,
    InputLabel,
    Select,
    Chip,
    Box,
    OutlinedInput,
    FormHelperText,
    FormControlLabel,
    Switch,
    Alert
} from '@mui/material';

export default function ExamCommitteeForm({
    open,
    onClose,
    onSave,
    committee,
    departments,
    sessions,
    semesters,
    teachers,
    externalTeachers,
    editMode
}) {
    const [formData, setFormData] = useState({
        name: '',
        session_id: '',
        department_id: '',
        semesters: [],
        president_id: '',
        member_1_id: '',
        member_2_id: '',
        is_active: true
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (committee && editMode) {
            setFormData({
                name: committee.name || '',
                session_id: committee.session_id?._id || '',
                department_id: committee.department_id?._id || '',
                semesters: committee.semesters ? committee.semesters.map(sem => typeof sem === 'object' ? sem._id : sem) : [],
                president_id: committee.president_id?._id || '',
                member_1_id: committee.member_1_id?._id || '',
                member_2_id: committee.member_2_id?._id || '',
                is_active: committee.is_active !== undefined ? committee.is_active : true
            });
        } else {
            // Reset form for new committee
            setFormData({
                name: '',
                session_id: '',
                department_id: '',
                semesters: [],
                president_id: '',
                member_1_id: '',
                member_2_id: '',
                is_active: true
            });
        }

        setErrors({});
        setFormError('');
    }, [committee, editMode, open]);

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.name.trim()) newErrors.name = 'Committee name is required';
        if (!formData.session_id) newErrors.session_id = 'Session is required';
        if (!formData.department_id) newErrors.department_id = 'Department is required';
        if (formData.semesters.length === 0) newErrors.semesters = 'At least one semester is required';
        if (!formData.president_id) newErrors.president_id = 'Committee president is required';
        if (!formData.member_1_id) newErrors.member_1_id = 'Committee member 1 is required';
        if (!formData.member_2_id) newErrors.member_2_id = 'Committee member 2 is required';

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

    const handleSwitchChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSemestersChange = (event) => {
        const {
            target: { value },
        } = event;
        setFormData(prev => ({
            ...prev,
            semesters: typeof value === 'string' ? value.split(',') : value
        }));

        if (errors.semesters) {
            setErrors(prev => ({ ...prev, semesters: undefined }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setFormError('');

        try {
            const success = await onSave(formData);
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
                {editMode ? 'Edit Exam Committee' : 'Add New Exam Committee'}
            </DialogTitle>

            <DialogContent dividers>
                {formError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {formError}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            name="name"
                            label="Committee Name"
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
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.session_id}
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
                            <InputLabel id="session-label">Session</InputLabel>
                            <Select
                                labelId="session-label"
                                name="session_id"
                                value={formData.session_id}
                                onChange={handleChange}
                                label="Session"
                                disabled={loading || editMode} // Cannot change session in edit mode
                            >
                                {sessions.map(session => (
                                    <MenuItem key={session._id} value={session._id}>
                                        {session.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.session_id && <FormHelperText>{errors.session_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.department_id}
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
                            <InputLabel id="department-label">Department</InputLabel>
                            <Select
                                labelId="department-label"
                                name="department_id"
                                value={formData.department_id}
                                onChange={handleChange}
                                label="Department"
                                disabled={loading || editMode} // Cannot change department in edit mode
                            >
                                {departments.map(department => (
                                    <MenuItem key={department._id} value={department._id}>
                                        {department.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.department_id && <FormHelperText>{errors.department_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.semesters}
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
                            <InputLabel id="semesters-label">Semesters</InputLabel>
                            <Select
                                labelId="semesters-label"
                                multiple
                                value={formData.semesters}
                                onChange={handleSemestersChange}
                                input={<OutlinedInput label="Semesters" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((value) => {
                                            const semester = semesters.find(s => s._id === value);
                                            return (
                                                <Chip
                                                    key={value}
                                                    label={semester ? semester.name : value}
                                                    sx={{ bgcolor: '#025c53', color: 'white' }}
                                                />
                                            );
                                        })}
                                    </Box>
                                )}
                                disabled={loading}
                            >
                                {semesters.map((semester) => (
                                    <MenuItem key={semester._id} value={semester._id}>
                                        {semester.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.semesters && <FormHelperText>{errors.semesters}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.president_id}
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
                            <InputLabel id="president-label">Committee President</InputLabel>
                            <Select
                                labelId="president-label"
                                name="president_id"
                                value={formData.president_id}
                                onChange={handleChange}
                                label="Committee President"
                                disabled={loading}
                            >
                                {teachers.map(teacher => (
                                    <MenuItem key={teacher._id} value={teacher._id}>
                                        {teacher.name} ({teacher.designation})
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.president_id && <FormHelperText>{errors.president_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.member_1_id}
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
                            <InputLabel id="member1-label">Committee Member 1</InputLabel>
                            <Select
                                labelId="member1-label"
                                name="member_1_id"
                                value={formData.member_1_id}
                                onChange={handleChange}
                                label="Committee Member 1"
                                disabled={loading}
                            >
                                {teachers.map(teacher => (
                                    <MenuItem key={teacher._id} value={teacher._id}>
                                        {teacher.name} ({teacher.designation})
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.member_1_id && <FormHelperText>{errors.member_1_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.member_2_id}
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
                            <InputLabel id="member2-label">Committee Member 2 (External)</InputLabel>
                            <Select
                                labelId="member2-label"
                                name="member_2_id"
                                value={formData.member_2_id}
                                onChange={handleChange}
                                label="Committee Member 2 (External)"
                                disabled={loading}
                            >
                                {externalTeachers.map(teacher => (
                                    <MenuItem key={teacher._id} value={teacher._id}>
                                        {teacher.name} ({teacher.university_name})
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.member_2_id && <FormHelperText>{errors.member_2_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_active}
                                    onChange={handleSwitchChange}
                                    name="is_active"
                                />
                            }
                            label="Active Committee"
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