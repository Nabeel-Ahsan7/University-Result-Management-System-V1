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

export default function ExamCommitteeTable({ examCommittees, onEdit, onDelete, onView, loading }) {
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
                            <TableCell sx={{ fontWeight: 'bold' }}>Committee Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Session</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>President</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {examCommittees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>
                                        No exam committees found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            examCommittees
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((committee) => (
                                    <TableRow key={committee._id} hover>
                                        <TableCell>{committee.name}</TableCell>
                                        <TableCell>{committee.session_id?.name || 'N/A'}</TableCell>
                                        <TableCell>{committee.department_id?.name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={committee.is_active ? 'Active' : 'Inactive'}
                                                size="small"
                                                color={committee.is_active ? 'success' : 'default'}
                                                sx={{
                                                    bgcolor: committee.is_active ? '#4caf50' : '#9e9e9e',
                                                    color: 'white'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{committee.president_id?.name || 'N/A'}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => onView(committee)}
                                                        size="small"
                                                        sx={{ color: '#025c53' }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        onClick={() => onEdit(committee)}
                                                        size="small"
                                                        sx={{ color: '#2196f3' }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        onClick={() => onDelete(committee)}
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
                count={examCommittees.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Paper>
    );
}