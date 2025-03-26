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
    Badge
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    HourglassEmpty as PendingIcon
} from '@mui/icons-material';

export default function ExamResultsTable({ exams, onViewDetails }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Get status icon and color
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'completed':
                return {
                    icon: <CheckCircleIcon fontSize="small" />,
                    color: 'success',
                    label: 'Completed'
                };
            case 'in_progress':
                return {
                    icon: <PendingIcon fontSize="small" />,
                    color: 'warning',
                    label: 'In Progress'
                };
            case 'pending':
            default:
                return {
                    icon: <ErrorIcon fontSize="small" />,
                    color: 'error',
                    label: 'Pending'
                };
        }
    };

    // Helper to determine if internal marks are complete
    const isInternalComplete = (internalMarks) => {
        return internalMarks.submitted_by !== undefined && internalMarks.submitted_by !== null;
    };

    // Helper to determine if external marks are complete
    const isExternalComplete = (externalMarks) => {
        if (externalMarks.is_third_required) {
            return externalMarks.first_submitted_by &&
                externalMarks.second_submitted_by &&
                externalMarks.third_submitted_by;
        }
        return externalMarks.first_submitted_by && externalMarks.second_submitted_by;
    };

    return (
        <Paper>
            <TableContainer sx={{ maxHeight: 650 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 180 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 180 }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Committee & Session</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Student Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Internal Marks</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>External Marks</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 100 }}>Final Grade</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 80 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {exams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No exam data found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            exams
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((exam) => {
                                    const statusDisplay = getStatusDisplay(exam.status);
                                    const internalComplete = isInternalComplete(exam.internal_marks);
                                    const externalComplete = isExternalComplete(exam.external_marks);

                                    return (
                                        <TableRow key={exam.exam_id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {exam.student.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {exam.student.registration_number}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Roll: {exam.student.roll_number}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {exam.course.code}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {exam.course.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ display: 'block' }}>
                                                    Credit: {exam.course.credit}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {exam.committee.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {exam.committee.session}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={exam.student.type === 'regular' ? 'Regular' : 'Improvement'}
                                                    size="small"
                                                    color={exam.student.type === 'regular' ? 'primary' : 'secondary'}
                                                    sx={{
                                                        bgcolor: exam.student.type === 'regular' ? '#1976d2' : '#e91e63',
                                                        color: 'white'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    color={internalComplete ? "success" : "error"}
                                                    variant="dot"
                                                    sx={{ '& .MuiBadge-badge': { top: 2, right: -4 } }}
                                                >
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {exam.internal_marks.total.toFixed(2)}/40
                                                    </Typography>
                                                </Badge>
                                                {internalComplete && (
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        By: {exam.internal_marks.submitted_by || 'N/A'}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    color={externalComplete ? "success" : "error"}
                                                    variant="dot"
                                                    sx={{ '& .MuiBadge-badge': { top: 2, right: -4 } }}
                                                >
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {exam.external_marks.average.toFixed(2)}/100
                                                    </Typography>
                                                </Badge>
                                                {exam.external_marks.is_third_required && (
                                                    <Chip
                                                        label="Third examiner required"
                                                        size="small"
                                                        color="warning"
                                                        sx={{ mt: 0.5, fontSize: '0.65rem' }}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                                                    {exam.grade.letter}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {exam.final_marks.toFixed(2)} (GPA: {exam.grade.point.toFixed(2)})
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    icon={statusDisplay.icon}
                                                    label={statusDisplay.label}
                                                    color={statusDisplay.color}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        onClick={() => onViewDetails(exam)}
                                                        size="small"
                                                        sx={{ color: '#025c53' }}
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={exams.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}