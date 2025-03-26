import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    MenuItem,
    Button,
    Paper,
    Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export default function StudentFilter({ searchParams, setSearchParams, departments, sessions, onSearch }) {
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({ ...prev, [name]: value }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            onSearch();
        }
    };

    const handleReset = () => {
        setSearchParams({
            query: '',
            department_id: '',
            current_session_id: '',
            type: ''
        });
        // Use a setTimeout to ensure state is updated before searching
        setTimeout(onSearch, 0);
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <TextField
                    name="query"
                    placeholder="Search by name, email, registration or roll number..."
                    variant="outlined"
                    fullWidth
                    value={searchParams.query}
                    onChange={handleSearchChange}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flex: 2 }}
                />

                <Grid container spacing={2} sx={{ flex: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            select
                            name="department_id"
                            label="Department"
                            variant="outlined"
                            fullWidth
                            value={searchParams.department_id}
                            onChange={handleSearchChange}
                        >
                            <MenuItem value="">All Departments</MenuItem>
                            {departments.map(dept => (
                                <MenuItem key={dept._id} value={dept._id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            select
                            name="current_session_id"
                            label="Session"
                            variant="outlined"
                            fullWidth
                            value={searchParams.current_session_id}
                            onChange={handleSearchChange}
                        >
                            <MenuItem value="">All Sessions</MenuItem>
                            {sessions.map(session => (
                                <MenuItem key={session._id} value={session._id}>
                                    {session.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            select
                            name="type"
                            label="Student Type"
                            variant="outlined"
                            fullWidth
                            value={searchParams.type}
                            onChange={handleSearchChange}
                        >
                            <MenuItem value="">All Types</MenuItem>
                            <MenuItem value="undergraduate">Undergraduate</MenuItem>
                            <MenuItem value="graduate">Graduate</MenuItem>
                            <MenuItem value="masters">Masters</MenuItem>
                            <MenuItem value="phd">PhD</MenuItem>
                        </TextField>
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
                            height: '100%',
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
                            height: '100%'
                        }}
                    >
                        Reset
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}