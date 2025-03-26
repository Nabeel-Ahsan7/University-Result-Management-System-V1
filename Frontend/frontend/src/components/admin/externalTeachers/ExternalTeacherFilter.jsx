import React from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Button,
    Paper,
    Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

export default function ExternalTeacherFilter({ searchParams, setSearchParams, onSearch, onReset }) {
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
            university: '',
            designation: ''
        });
        setTimeout(onReset, 0);
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <TextField
                    name="query"
                    placeholder="Search by name, email, department or phone..."
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

                <Grid container spacing={2} sx={{ flex: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="university"
                            label="University"
                            variant="outlined"
                            fullWidth
                            value={searchParams.university}
                            onChange={handleSearchChange}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="designation"
                            label="Designation"
                            variant="outlined"
                            fullWidth
                            value={searchParams.designation}
                            onChange={handleSearchChange}
                        />
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