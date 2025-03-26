import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Paper,
    Grid
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export default function CourseAssignmentFilter({
    searchParams,
    setSearchParams,
    examCommittees,
    semesters,
    courses,
    onSearch,
    onReset
}) {
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setSearchParams({
            exam_committee_id: '',
            semester_id: '',
            course_id: ''
        });
        setTimeout(onReset, 0);
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Grid container spacing={2} sx={{ flex: 1 }}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="committee-filter-label">Exam Committee</InputLabel>
                            <Select
                                labelId="committee-filter-label"
                                name="exam_committee_id"
                                value={searchParams.exam_committee_id}
                                onChange={handleSearchChange}
                                label="Exam Committee"
                            >
                                <MenuItem value="">All Committees</MenuItem>
                                {examCommittees.map(committee => (
                                    <MenuItem key={committee._id} value={committee._id}>
                                        {committee.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="semester-filter-label">Semester</InputLabel>
                            <Select
                                labelId="semester-filter-label"
                                name="semester_id"
                                value={searchParams.semester_id}
                                onChange={handleSearchChange}
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

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="course-filter-label">Course</InputLabel>
                            <Select
                                labelId="course-filter-label"
                                name="course_id"
                                value={searchParams.course_id}
                                onChange={handleSearchChange}
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
                </Grid>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<FilterListIcon />}
                        onClick={onSearch}
                        sx={{
                            bgcolor: '#025c53',
                            '&:hover': { bgcolor: '#01413a' },
                            height: '56px',
                            minWidth: '120px'
                        }}
                    >
                        Filter
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<ClearIcon />}
                        onClick={handleReset}
                        sx={{
                            color: '#025c53',
                            borderColor: '#025c53',
                            '&:hover': {
                                borderColor: '#01413a',
                                bgcolor: 'rgba(2, 92, 83, 0.04)'
                            },
                            height: '56px'
                        }}
                    >
                        Reset
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}