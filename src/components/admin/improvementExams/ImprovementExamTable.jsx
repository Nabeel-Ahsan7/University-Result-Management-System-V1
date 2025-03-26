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
    CircularProgress,
    LinearProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ScheduleIcon from '@mui/icons-material/Schedule';

export default function ImprovementExamTable({ improvementExams, onDelete, loading }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Format date for better readability
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Generate status chip with appropriate color
    const renderStatusChip = (status) => {
        let color, icon, label;

        switch (status) {
            case 'completed':
                color = 'success';
                icon = <CheckCircleIcon />;
                label = 'Completed';
                break;
            case 'in_progress':
                color = 'info';
                icon = <ScheduleIcon />;
                label = 'In Progress';
                break;
            case 'pending':
            default:
                color = 'warning';
                icon = <PendingIcon />;
                label = 'Pending';
        }

        return (
            <Chip
                icon={icon}
                label={label}
                color={color}
                size="small"
            />
        );
    };

    return (
        <Paper sx={{ width: '100%' }}>
            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Committee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Semester</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Date Added</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && improvementExams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <CircularProgress size={30} sx={{ my: 3, color: '#025c53' }} />
                                </TableCell>
                            </TableRow>
                        ) : improvementExams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography sx={{ py: 3, color: 'text.secondary' }}>
                                        No improvement exams found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            improvementExams
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((exam) => (
                                    <TableRow key={exam._id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {exam.student_id.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Reg: {exam.student_id.registration_number}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Roll: {exam.student_id.roll_number}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {exam.course_assignment_id.course_id.course_code}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {exam.course_assignment_id.course_id.course_name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {exam.course_assignment_id.exam_committee_id.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {exam.course_assignment_id.exam_committee_id.department_id?.name || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {exam.course_assignment_id.semester_id.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {exam.course_assignment_id.exam_committee_id.session_id?.name || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(exam.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            {renderStatusChip(exam.status)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    onClick={() => onDelete(exam._id)}
                                                    color="error"
                                                    size="small"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                        {loading && improvementExams.length > 0 && (
                            <TableRow>
                                <TableCell colSpan={7} sx={{ p: 0 }}>
                                    <LinearProgress sx={{ height: 3, bgcolor: 'rgba(2, 92, 83, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#025c53' } }} />
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={improvementExams.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}