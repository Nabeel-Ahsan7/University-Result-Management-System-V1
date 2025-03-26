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
    Chip,
    Typography,
    Autocomplete,
    Collapse,
    IconButton
} from '@mui/material';
import {
    FilterList as FilterIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Clear as ClearIcon
} from '@mui/icons-material';

export default function ExamFilter({
    committees,
    departments,
    sessions,
    semesters,
    courses,
    students,
    filterParams,
    setFilterParams,
    onSearchStudents,
    onApplyFilters,
    onResetFilters
}) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchInput, setSearchInput] = useState('');

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterParams(prev => ({ ...prev, [name]: value }));
    };

    const handleStudentSearch = (e, value) => {
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

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Filter Exams</Typography>
                <Button
                    startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    color="primary"
                >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                </Button>
            </Box>

            {/* Basic filters */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Committee</InputLabel>
                        <Select
                            name="committee_id"
                            value={filterParams.committee_id}
                            onChange={handleFilterChange}
                            label="Committee"
                        >
                            <MenuItem value="">All Committees</MenuItem>
                            {committees.map(committee => (
                                <MenuItem key={committee._id} value={committee._id}>
                                    {committee.name} ({committee.session_id?.name})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Session</InputLabel>
                        <Select
                            name="session_id"
                            value={filterParams.session_id}
                            onChange={handleFilterChange}
                            label="Session"
                        >
                            <MenuItem value="">All Sessions</MenuItem>
                            {sessions.map(session => (
                                <MenuItem key={session._id} value={session._id}>
                                    {session.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                            name="department_id"
                            value={filterParams.department_id}
                            onChange={handleFilterChange}
                            label="Department"
                        >
                            <MenuItem value="">All Departments</MenuItem>
                            {departments.map(department => (
                                <MenuItem key={department._id} value={department._id}>
                                    {department.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {/* Advanced filters */}
            <Collapse in={showAdvanced}>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Semester</InputLabel>
                                <Select
                                    name="semester_id"
                                    value={filterParams.semester_id}
                                    onChange={handleFilterChange}
                                    label="Semester"
                                >
                                    <MenuItem value="">All Semesters</MenuItem>
                                    {semesters.map(semester => (
                                        <MenuItem key={semester._id} value={semester._id}>
                                            {semester.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Course</InputLabel>
                                <Select
                                    name="course_id"
                                    value={filterParams.course_id}
                                    onChange={handleFilterChange}
                                    label="Course"
                                >
                                    <MenuItem value="">All Courses</MenuItem>
                                    {courses.map(course => (
                                        <MenuItem key={course._id} value={course._id}>
                                            {course.course_code} - {course.course_name}
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
                                onChange={handleStudentSearch}
                                onInputChange={handleInputChange}
                                inputValue={searchInput}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search Student"
                                        helperText="Type at least 3 characters"
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body1">{option.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {option.registration_number} | {option.roll_number}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Collapse>

            {/* Filter actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ClearIcon />}
                    onClick={onResetFilters}
                >
                    Clear Filters
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