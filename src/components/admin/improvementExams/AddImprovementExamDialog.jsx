import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    TextField,
    Typography,
    Autocomplete,
    CircularProgress,
    Alert,
    FormHelperText,
    Box,
    Divider
} from '@mui/material';
import api from '@/services/api';

export default function AddImprovementExamDialog({
    open,
    onClose,
    onSave,
    examCommittees,
    courseAssignments,
    departments
}) {
    const [formData, setFormData] = useState({
        student_id: '',
        course_assignment_id: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formStatus, setFormStatus] = useState({ error: null, success: false });

    // Student state
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // Filtered course assignments based on committee
    const [selectedCommittee, setSelectedCommittee] = useState('');
    const [availableCourseAssignments, setAvailableCourseAssignments] = useState([]);

    // Fetch all students
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoadingStudents(true);
                const response = await api.get('/admin/student');
                if (response.data.success) {
                    setAllStudents(response.data.students);
                    setFilteredStudents(response.data.students);
                }
            } catch (error) {
                console.error('Error fetching students:', error);
                setFormStatus({ error: 'Failed to load students', success: false });
            } finally {
                setLoadingStudents(false);
            }
        };

        if (open) {
            fetchStudents();
        }
    }, [open]);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (open) {
            setFormData({
                student_id: '',
                course_assignment_id: ''
            });
            setErrors({});
            setFormStatus({ error: null, success: false });
            setSelectedStudent(null);
            setSearchQuery('');
            setSelectedCommittee('');
            setSelectedDepartment('');
        }
    }, [open]);

    // Filter students when department or search query changes
    useEffect(() => {
        let result = allStudents;

        // Filter by department
        if (selectedDepartment) {
            result = result.filter(student =>
                student.department_id && student.department_id._id === selectedDepartment
            );
        }

        // Filter by search query
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(student =>
                student.name.toLowerCase().includes(lowerQuery) ||
                student.registration_number.toLowerCase().includes(lowerQuery) ||
                student.roll_number.toLowerCase().includes(lowerQuery)
            );
        }

        setFilteredStudents(result);
    }, [selectedDepartment, searchQuery, allStudents]);

    // Filter course assignments when committee changes
    useEffect(() => {
        if (selectedCommittee) {
            const filtered = courseAssignments.filter(
                ca => ca.exam_committee_id?._id === selectedCommittee
            );
            setAvailableCourseAssignments(filtered);
        } else {
            setAvailableCourseAssignments([]);
        }

        // Reset course assignment selection when committee changes
        setFormData(prev => ({ ...prev, course_assignment_id: '' }));
    }, [selectedCommittee, courseAssignments]);

    const handleStudentSelect = (e, value) => {
        setSelectedStudent(value);
        if (value) {
            setFormData(prev => ({ ...prev, student_id: value._id }));
            setErrors(prev => ({ ...prev, student_id: undefined }));

            // If student has a department, auto-select matching committee
            if (value.department_id) {
                const matchingCommittee = examCommittees.find(committee =>
                    committee.department_id?._id === value.department_id._id && committee.is_active
                );

                if (matchingCommittee) {
                    setSelectedCommittee(matchingCommittee._id);
                }
            }
        } else {
            setFormData(prev => ({ ...prev, student_id: '' }));
        }
    };

    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleCommitteeChange = (e) => {
        setSelectedCommittee(e.target.value);
    };

    const handleCourseAssignmentChange = (e) => {
        setFormData(prev => ({ ...prev, course_assignment_id: e.target.value }));
        setErrors(prev => ({ ...prev, course_assignment_id: undefined }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.student_id) newErrors.student_id = 'Student is required';
        if (!formData.course_assignment_id) newErrors.course_assignment_id = 'Course assignment is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setFormStatus({ error: null, success: false });

        try {
            const result = await onSave(formData);

            if (result.success) {
                setFormStatus({ error: null, success: true });
                // Close dialog after a short delay to show success message
                setTimeout(() => onClose(), 1500);
            } else {
                setFormStatus({ error: result.error || 'Failed to add improvement exam', success: false });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setFormStatus({
                error: error.response?.data?.message || 'Failed to add improvement exam',
                success: false
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#025c53', color: 'white' }}>
                Add Improvement Exam
            </DialogTitle>

            <DialogContent dividers>
                {formStatus.error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {formStatus.error}
                    </Alert>
                )}

                {formStatus.success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Improvement exam added successfully!
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                            Student Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Filter by Department</InputLabel>
                            <Select
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                label="Filter by Department"
                            >
                                <MenuItem value="">All Departments</MenuItem>
                                {departments.map(dept => (
                                    <MenuItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Search by Name, Roll, or Registration"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            variant="outlined"
                            placeholder="Type to search..."
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Autocomplete
                            fullWidth
                            options={filteredStudents}
                            getOptionLabel={(option) =>
                                `${option.name} (${option.registration_number} - ${option.roll_number})`
                            }
                            onChange={handleStudentSelect}
                            value={selectedStudent}
                            loading={loadingStudents}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Student"
                                    helperText={errors.student_id || "Choose a student from the list"}
                                    error={!!errors.student_id}
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingStudents ? <CircularProgress size={20} color="inherit" /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box>
                                        <Typography variant="body1">{option.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Reg: {option.registration_number} | Roll: {option.roll_number} |
                                            Dept: {option.department_id?.name || 'N/A'}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                            noOptionsText={
                                loadingStudents
                                    ? "Loading students..."
                                    : "No students found. Try changing filters."
                            }
                        />
                    </Grid>

                    {selectedStudent && (
                        <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="body2">
                                    <strong>Selected Student:</strong> {selectedStudent.name}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Department:</strong> {selectedStudent.department_id?.name || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Current Session:</strong> {selectedStudent.current_session_id?.name || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }} fontWeight="bold">
                            Exam Information
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                            <InputLabel>Exam Committee</InputLabel>
                            <Select
                                value={selectedCommittee}
                                onChange={handleCommitteeChange}
                                label="Exam Committee"
                            >
                                <MenuItem value="">Select Exam Committee</MenuItem>
                                {examCommittees.filter(ec => ec.is_active).map(committee => (
                                    <MenuItem key={committee._id} value={committee._id}>
                                        {committee.name}
                                        {committee.session_id ? ` (${committee.session_id.name})` : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>
                                {!selectedCommittee && "Select an active exam committee first"}
                            </FormHelperText>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl
                            fullWidth
                            required
                            error={!!errors.course_assignment_id}
                            disabled={!selectedCommittee}
                        >
                            <InputLabel>Course</InputLabel>
                            <Select
                                value={formData.course_assignment_id}
                                onChange={handleCourseAssignmentChange}
                                label="Course"
                            >
                                <MenuItem value="">Select Course</MenuItem>
                                {availableCourseAssignments.map(ca => (
                                    <MenuItem key={ca._id} value={ca._id}>
                                        {ca.course_id?.course_code} - {ca.course_id?.course_name} ({ca.semester_id?.name})
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.course_assignment_id && (
                                <FormHelperText>{errors.course_assignment_id}</FormHelperText>
                            )}
                            {selectedCommittee && availableCourseAssignments.length === 0 && (
                                <FormHelperText>
                                    No courses assigned to this committee
                                </FormHelperText>
                            )}
                        </FormControl>
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
                    disabled={loading || formStatus.success}
                    startIcon={loading && <CircularProgress size={20} color="inherit" />}
                    sx={{
                        bgcolor: '#025c53',
                        '&:hover': {
                            bgcolor: '#01413a',
                        }
                    }}
                >
                    {loading ? 'Adding...' : 'Add Improvement Exam'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}