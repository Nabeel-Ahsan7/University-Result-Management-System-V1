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

export default function StudentTable({ students, onEdit, onDelete, onView, loading }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'undergraduate':
                return '#025c53';
            case 'graduate':
                return '#2196f3';
            case 'masters':
                return '#4caf50';
            case 'phd':
                return '#ff9800';
            default:
                return '#757575';
        }
    };

    return (
        <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
            {loading && <LinearProgress sx={{ bgcolor: 'rgba(2, 92, 83, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#025c53' } }} />}

            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Registration No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Roll Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Session</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>
                                        No students found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            students
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((student) => (
                                    <TableRow key={student._id} hover>
                                        <TableCell>{student.registration_number}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>{student.roll_number}</TableCell>
                                        <TableCell>
                                            {student.department_id?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {student.current_session_id?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={student.type.charAt(0).toUpperCase() + student.type.slice(1)}
                                                size="small"
                                                sx={{
                                                    bgcolor: getTypeColor(student.type),
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => onView(student)}
                                                        size="small"
                                                        sx={{ color: '#025c53' }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        onClick={() => onEdit(student)}
                                                        size="small"
                                                        sx={{ color: '#2196f3' }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        onClick={() => onDelete(student)}
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
                count={students.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Paper>
    );
}