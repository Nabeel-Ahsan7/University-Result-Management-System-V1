import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    MenuItem,
    Button,
    Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export default function TeacherFilter({ searchParams, setSearchParams, departments, onSearch }) {
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
            department_id: ''
        });
        // Use a setTimeout to ensure state is updated before searching
        setTimeout(onSearch, 0);
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <TextField
                    name="query"
                    placeholder="Search by name, email, phone or designation..."
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

                <TextField
                    select
                    name="department_id"
                    label="Department"
                    variant="outlined"
                    fullWidth
                    value={searchParams.department_id}
                    onChange={handleSearchChange}
                    sx={{ flex: 1 }}
                >
                    <MenuItem value="">All Departments</MenuItem>
                    {departments.map(dept => (
                        <MenuItem key={dept._id} value={dept._id}>
                            {dept.name}
                        </MenuItem>
                    ))}
                </TextField>

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