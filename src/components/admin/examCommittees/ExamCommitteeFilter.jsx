import React from 'react';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export default function ExamCommitteeFilter({ searchParams, setSearchParams, departments, sessions, onSearch, onReset }) {
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleReset = () => {
        setSearchParams({
            session_id: '',
            department_id: '',
            is_active: ''
        });
        setTimeout(onReset, 0);
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Grid container spacing={2} sx={{ flex: 1 }}>
                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="session-filter-label">Session</InputLabel>
                            <Select
                                labelId="session-filter-label"
                                name="session_id"
                                value={searchParams.session_id}
                                onChange={handleSearchChange}
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

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="department-filter-label">Department</InputLabel>
                            <Select
                                labelId="department-filter-label"
                                name="department_id"
                                value={searchParams.department_id}
                                onChange={handleSearchChange}
                                label="Department"
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

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel id="status-filter-label">Status</InputLabel>
                            <Select
                                labelId="status-filter-label"
                                name="is_active"
                                value={searchParams.is_active}
                                onChange={handleSearchChange}
                                label="Status"
                            >
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="true">Active</MenuItem>
                                <MenuItem value="false">Inactive</MenuItem>
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