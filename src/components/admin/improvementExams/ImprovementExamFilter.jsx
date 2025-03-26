import React, { useState } from 'react';
import {
    Box,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Typography,
    Autocomplete
} from '@mui/material';
import {
    FilterList as FilterIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

export default function ImprovementExamFilter({
    filterParams,
    setFilterParams,
    examCommittees,
    courseAssignments,
    students,
    onSearchStudents,
    onApplyFilters,
    onResetFilters
}) {
    const [searchInput, setSearchInput] = useState('');

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterParams(prev => ({ ...prev, [name]: value }));
    };

    const handleStudentChange = (e, value) => {
        if (value) {
            setFilterParams(prev => ({ ...prev, student_id: value._id }));
        } else {
            setFilterParams(prev => ({ ...prev, student_id: '' }));
        }
    };

    const handleInputChange = (e, newValue) => {
        setSearchInput(newValue);
        if (newValue && newValue.length >= 3) {
            onSearchStudents(newValue);
        }
    };

    // Filter course assignments by committee if selected
    const filteredCourseAssignments = filterParams.committee_id
        ? courseAssignments.filter(ca =>
            ca.exam_committee_id && ca.exam_committee_id._id === filterParams.committee_id)
        : courseAssignments;

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Filter Improvement Exams
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Exam Committee</InputLabel>
                        <Select
                            name="committee_id"
                            value={filterParams.committee_id}
                            onChange={handleFilterChange}
                            label="Exam Committee"
                        >
                            <MenuItem value="">All Committees</MenuItem>
                            {examCommittees.map(committee => (
                                <MenuItem key={committee._id} value={committee._id}>
                                    {committee.name}
                                    {committee.session_id ? ` (${committee.session_id.name})` : ''}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Course Assignment</InputLabel>
                        <Select
                            name="course_assignment_id"
                            value={filterParams.course_assignment_id}
                            onChange={handleFilterChange}
                            label="Course Assignment"
                        >
                            <MenuItem value="">All Course Assignments</MenuItem>
                            {filteredCourseAssignments.map(ca => (
                                <MenuItem key={ca._id} value={ca._id}>
                                    {ca.course_id?.course_code} - {ca.course_id?.course_name} ({ca.semester_id?.name})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Autocomplete
                        fullWidth
                        options={students}
                        getOptionLabel={(option) =>
                            `${option.name} (${option.registration_number} - ${option.roll_number})`
                        }
                        onChange={handleStudentChange}
                        onInputChange={handleInputChange}
                        inputValue={searchInput}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Search Student"
                                helperText="Type at least 3 characters"
                            />
                        )}
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={onResetFilters}
                    sx={{
                        color: '#025c53',
                        borderColor: '#025c53',
                        '&:hover': {
                            borderColor: '#01413a',
                            backgroundColor: 'rgba(2, 92, 83, 0.04)'
                        }
                    }}
                >
                    Reset
                </Button>
                <Button
                    variant="contained"
                    startIcon={<FilterIcon />}
                    onClick={onApplyFilters}
                    sx={{ bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                >
                    Apply Filters
                </Button>
            </Box>
        </Paper>
    );
}