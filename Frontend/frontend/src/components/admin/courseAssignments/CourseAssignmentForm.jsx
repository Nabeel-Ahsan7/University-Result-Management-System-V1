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
    CircularProgress,
    Typography,
    FormHelperText,
    Alert
} from '@mui/material';

export default function CourseAssignmentForm({
    open,
    onClose,
    onSave,
    assignment,
    examCommittees,
    semesters,
    courses,
    teachers,
    externalTeachers,
    editMode
}) {
    const [formData, setFormData] = useState({
        exam_committee_id: '',
        semester_id: '',
        course_id: '',
        first_examiner_id: '',
        first_examiner_type: 'Teacher',
        second_examiner_id: '',
        second_examiner_type: 'Teacher',
        third_examiner_id: '',
        third_examiner_type: 'Teacher'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [availableSemesters, setAvailableSemesters] = useState([]);

    useEffect(() => {
        if (assignment && editMode) {
            setFormData({
                exam_committee_id: assignment.exam_committee_id?._id || '',
                semester_id: assignment.semester_id?._id || '',
                course_id: assignment.course_id?._id || '',
                first_examiner_id: assignment.first_examiner_id?._id || '',
                first_examiner_type: assignment.first_examiner_type || 'Teacher',
                second_examiner_id: assignment.second_examiner_id?._id || '',
                second_examiner_type: assignment.second_examiner_type || 'Teacher',
                third_examiner_id: assignment.third_examiner_id?._id || '',
                third_examiner_type: assignment.third_examiner_type || 'Teacher'
            });
        } else {
            // Reset form for new assignment
            setFormData({
                exam_committee_id: '',
                semester_id: '',
                course_id: '',
                first_examiner_id: '',
                first_examiner_type: 'Teacher',
                second_examiner_id: '',
                second_examiner_type: 'Teacher',
                third_examiner_id: '',
                third_examiner_type: 'Teacher'
            });
        }

        setErrors({});
        setFormError('');
    }, [assignment, editMode, open]);

    // Update available semesters when exam committee changes
    useEffect(() => {
        if (formData.exam_committee_id) {
            const selectedCommittee = examCommittees.find(c => c._id === formData.exam_committee_id);
            if (selectedCommittee && selectedCommittee.semesters) {
                const semesterIds = selectedCommittee.semesters.map(s =>
                    typeof s === 'object' ? s._id : s
                );
                const filteredSemesters = semesters.filter(s => semesterIds.includes(s._id));
                setAvailableSemesters(filteredSemesters);

                // If current semester is not in available semesters, reset it
                if (formData.semester_id && !semesterIds.includes(formData.semester_id)) {
                    setFormData(prev => ({ ...prev, semester_id: '' }));
                }
            } else {
                setAvailableSemesters([]);
            }
        } else {
            setAvailableSemesters([]);
        }
    }, [formData.exam_committee_id, examCommittees, semesters]);

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.exam_committee_id) newErrors.exam_committee_id = 'Exam committee is required';
        if (!formData.semester_id) newErrors.semester_id = 'Semester is required';
        if (!formData.course_id) newErrors.course_id = 'Course is required';
        if (!formData.first_examiner_id) newErrors.first_examiner_id = 'First examiner is required';
        if (!formData.second_examiner_id) newErrors.second_examiner_id = 'Second examiner is required';

        // Validate that examiners are different
        if (formData.first_examiner_id && formData.second_examiner_id &&
            formData.first_examiner_id === formData.second_examiner_id &&
            formData.first_examiner_type === formData.second_examiner_type) {
            newErrors.second_examiner_id = 'Second examiner must be different from first examiner';
        }

        if (formData.third_examiner_id) {
            if (formData.first_examiner_id === formData.third_examiner_id &&
                formData.first_examiner_type === formData.third_examiner_type) {
                newErrors.third_examiner_id = 'Third examiner must be different from first examiner';
            }
            if (formData.second_examiner_id === formData.third_examiner_id &&
                formData.second_examiner_type === formData.third_examiner_type) {
                newErrors.third_examiner_id = 'Third examiner must be different from second examiner';
            }
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

    const getExaminerList = (type) => {
        return type === 'Teacher' ? teachers : externalTeachers;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#025c53', color: 'white' }}>
                {editMode ? 'Edit Course Assignment' : 'Add New Course Assignment'}
            </DialogTitle>

            <DialogContent dividers>
                {formError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {formError}
                    </Alert>
                )}

                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.exam_committee_id}
                            disabled={editMode}
                            required
                        >
                            <InputLabel id="exam-committee-label">Exam Committee</InputLabel>
                            <Select
                                labelId="exam-committee-label"
                                name="exam_committee_id"
                                value={formData.exam_committee_id}
                                onChange={handleChange}
                                label="Exam Committee"
                            >
                                <MenuItem value="">Select Exam Committee</MenuItem>
                                {examCommittees
                                    .filter(committee => committee.is_active)
                                    .map(committee => (
                                        <MenuItem key={committee._id} value={committee._id}>
                                            {committee.name} ({committee.session_id?.name})
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                            {errors.exam_committee_id && <FormHelperText>{errors.exam_committee_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.semester_id}
                            disabled={!formData.exam_committee_id || editMode}
                            required
                        >
                            <InputLabel id="semester-label">Semester</InputLabel>
                            <Select
                                labelId="semester-label"
                                name="semester_id"
                                value={formData.semester_id}
                                onChange={handleChange}
                                label="Semester"
                            >
                                <MenuItem value="">Select Semester</MenuItem>
                                {availableSemesters.map(semester => (
                                    <MenuItem key={semester._id} value={semester._id}>
                                        {semester.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.semester_id && <FormHelperText>{errors.semester_id}</FormHelperText>}
                            {formData.exam_committee_id && availableSemesters.length === 0 && (
                                <FormHelperText>No semesters available for selected committee</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.course_id}
                            disabled={editMode}
                            required
                        >
                            <InputLabel id="course-label">Course</InputLabel>
                            <Select
                                labelId="course-label"
                                name="course_id"
                                value={formData.course_id}
                                onChange={handleChange}
                                label="Course"
                            >
                                <MenuItem value="">Select Course</MenuItem>
                                {courses.map(course => (
                                    <MenuItem key={course._id} value={course._id}>
                                        {course.course_code} - {course.course_name} ({course.credit} Credits)
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.course_id && <FormHelperText>{errors.course_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                            First Examiner (Internal)
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.first_examiner_type}
                            required
                        >
                            <InputLabel id="first-examiner-type-label">Examiner Type</InputLabel>
                            <Select
                                labelId="first-examiner-type-label"
                                name="first_examiner_type"
                                value={formData.first_examiner_type}
                                onChange={handleChange}
                                label="Examiner Type"
                            >
                                <MenuItem value="Teacher">Internal Teacher</MenuItem>
                                <MenuItem value="ExternalTeacher">External Teacher</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.first_examiner_id}
                            required
                        >
                            <InputLabel id="first-examiner-label">First Examiner</InputLabel>
                            <Select
                                labelId="first-examiner-label"
                                name="first_examiner_id"
                                value={formData.first_examiner_id}
                                onChange={handleChange}
                                label="First Examiner"
                            >
                                <MenuItem value="">Select First Examiner</MenuItem>
                                {getExaminerList(formData.first_examiner_type).map(examiner => (
                                    <MenuItem key={examiner._id} value={examiner._id}>
                                        {examiner.name}
                                        {examiner.designation && ` (${examiner.designation})`}
                                        {examiner.university_name && ` - ${examiner.university_name}`}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.first_examiner_id && <FormHelperText>{errors.first_examiner_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                            Second Examiner
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.second_examiner_type}
                            required
                        >
                            <InputLabel id="second-examiner-type-label">Examiner Type</InputLabel>
                            <Select
                                labelId="second-examiner-type-label"
                                name="second_examiner_type"
                                value={formData.second_examiner_type}
                                onChange={handleChange}
                                label="Examiner Type"
                            >
                                <MenuItem value="Teacher">Internal Teacher</MenuItem>
                                <MenuItem value="ExternalTeacher">External Teacher</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.second_examiner_id}
                            required
                        >
                            <InputLabel id="second-examiner-label">Second Examiner</InputLabel>
                            <Select
                                labelId="second-examiner-label"
                                name="second_examiner_id"
                                value={formData.second_examiner_id}
                                onChange={handleChange}
                                label="Second Examiner"
                            >
                                <MenuItem value="">Select Second Examiner</MenuItem>
                                {getExaminerList(formData.second_examiner_type).map(examiner => (
                                    <MenuItem key={examiner._id} value={examiner._id}>
                                        {examiner.name}
                                        {examiner.designation && ` (${examiner.designation})`}
                                        {examiner.university_name && ` - ${examiner.university_name}`}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.second_examiner_id && <FormHelperText>{errors.second_examiner_id}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                            Third Examiner (Optional)
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.third_examiner_type}
                        >
                            <InputLabel id="third-examiner-type-label">Examiner Type</InputLabel>
                            <Select
                                labelId="third-examiner-type-label"
                                name="third_examiner_type"
                                value={formData.third_examiner_type}
                                onChange={handleChange}
                                label="Examiner Type"
                            >
                                <MenuItem value="Teacher">Internal Teacher</MenuItem>
                                <MenuItem value="ExternalTeacher">External Teacher</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <FormControl
                            fullWidth
                            margin="normal"
                            error={!!errors.third_examiner_id}
                        >
                            <InputLabel id="third-examiner-label">Third Examiner</InputLabel>
                            <Select
                                labelId="third-examiner-label"
                                name="third_examiner_id"
                                value={formData.third_examiner_id}
                                onChange={handleChange}
                                label="Third Examiner"
                            >
                                <MenuItem value="">None</MenuItem>
                                {getExaminerList(formData.third_examiner_type).map(examiner => (
                                    <MenuItem key={examiner._id} value={examiner._id}>
                                        {examiner.name}
                                        {examiner.designation && ` (${examiner.designation})`}
                                        {examiner.university_name && ` - ${examiner.university_name}`}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.third_examiner_id && <FormHelperText>{errors.third_examiner_id}</FormHelperText>}
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