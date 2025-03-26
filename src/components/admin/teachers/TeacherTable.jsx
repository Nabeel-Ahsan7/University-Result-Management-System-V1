import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    IconButton,
    Tooltip,
    Box,
    Chip,
    Typography,
    LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function TeacherTable({ teachers, onEdit, onDelete, onView, loading }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
            {loading && <LinearProgress sx={{ bgcolor: 'rgba(2, 92, 83, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#025c53' } }} />}

            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Designation</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {teachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>
                                        No teachers found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            teachers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((teacher) => (
                                    <TableRow key={teacher._id} hover>
                                        <TableCell>{teacher.name}</TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={teacher.designation}
                                                size="small"
                                                sx={{
                                                    bgcolor: getDesignationColor(teacher.designation),
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {teacher.department_id?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>{teacher.phone_number}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => onView(teacher)}
                                                        size="small"
                                                        sx={{ color: '#025c53' }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        onClick={() => onEdit(teacher)}
                                                        size="small"
                                                        sx={{ color: '#2196f3' }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        onClick={() => onDelete(teacher)}
                                                        size="small"
                                                        sx={{ color: '#f44336' }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={teachers.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Paper>
    );
}

// Helper function to get color based on designation
function getDesignationColor(designation) {
    const designationLower = designation.toLowerCase();
    if (designationLower.includes('professor')) {
        if (designationLower.includes('assistant')) return '#4caf50';
        if (designationLower.includes('associate')) return '#2196f3';
        return '#9c27b0'; // Full professor
    } else if (designationLower.includes('lecturer')) {
        if (designationLower.includes('senior')) return '#ff9800';
        return '#03a9f4';
    }
    return '#757575'; // Default
}