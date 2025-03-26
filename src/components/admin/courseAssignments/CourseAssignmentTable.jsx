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
import SchoolIcon from '@mui/icons-material/School';

export default function CourseAssignmentTable({ courseAssignments, onEdit, onDelete, onView, loading }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getExaminerColor = (examinerType) => {
        switch (examinerType) {
            case 'Teacher':
                return '#4caf50';
            case 'ExternalTeacher':
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
                            <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Committee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Semester</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>First Examiner</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Second Examiner</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courseAssignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body1" sx={{ py: 2, color: 'text.secondary' }}>
                                        No course assignments found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            courseAssignments
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((assignment) => (
                                    <TableRow key={assignment._id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {assignment.course_id?.course_code}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {assignment.course_id?.course_name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {assignment.exam_committee_id?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {assignment.semester_id?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    icon={<SchoolIcon />}
                                                    label={assignment.first_examiner_type}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getExaminerColor(assignment.first_examiner_type),
                                                        color: 'white'
                                                    }}
                                                />
                                                <Typography variant="body2">
                                                    {assignment.first_examiner_id?.name || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    icon={<SchoolIcon />}
                                                    label={assignment.second_examiner_type}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getExaminerColor(assignment.second_examiner_type),
                                                        color: 'white'
                                                    }}
                                                />
                                                <Typography variant="body2">
                                                    {assignment.second_examiner_id?.name || 'N/A'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => onView(assignment)}
                                                        size="small"
                                                        sx={{ color: '#025c53' }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        onClick={() => onEdit(assignment)}
                                                        size="small"
                                                        sx={{ color: '#2196f3' }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        onClick={() => onDelete(assignment)}
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
                count={courseAssignments.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Paper>
    );
}