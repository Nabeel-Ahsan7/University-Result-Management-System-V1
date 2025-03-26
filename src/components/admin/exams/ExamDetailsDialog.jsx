import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Paper,
    Divider,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    Avatar
} from '@mui/material';
import {
    Close as CloseIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    MenuBook as MenuBookIcon,
    Assignment as AssignmentIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';

export default function ExamDetailsDialog({ open, onClose, exam }) {
    if (!exam) return null;
    console.log(exam)
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        return new Date(dateString).toLocaleString();
    };

    // Calculate grade color
    const getGradeColor = (grade) => {
        // Add null safety checks
        if (!grade || !grade.letter) return '#f44336'; // Default red for missing grade
        console.log(grade);
        if (grade.letter.startsWith('A')) return '#4caf50';
        if (grade.letter.startsWith('B')) return '#2196f3';
        if (grade.letter.startsWith('C')) return '#ff9800';
        if (grade.letter === 'D') return '#ff5722';
        return '#f44336';
    };

    // Get initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ bgcolor: '#025c53', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                    Exam Detail: {exam.course.code} - {exam.student.name}
                </Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Student and Course Info */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PersonIcon sx={{ mr: 1, color: '#025c53' }} />
                                <Typography variant="h6">Student Information</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                                <Avatar sx={{ bgcolor: '#025c53', mr: 2 }}>
                                    {getInitials(exam.student.name)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{exam.student.name}</Typography>
                                    <Typography variant="body2">Registration: {exam.student.registration_number}</Typography>
                                    <Typography variant="body2">Roll: {exam.student.roll_number}</Typography>
                                    <Typography variant="body2">Department: {exam.student.department}</Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <Chip
                                            label={exam.student.type === 'regular' ? 'Regular Student' : 'Improvement Exam'}
                                            size="small"
                                            color={exam.student.type === 'regular' ? 'primary' : 'secondary'}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <MenuBookIcon sx={{ mr: 1, color: '#025c53' }} />
                                <Typography variant="h6">Course Information</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="subtitle1">{exam.course.code} - {exam.course.name}</Typography>
                            <Typography variant="body2">Credit Hours: {exam.course.credit}</Typography>
                            <Typography variant="body2">Semester: {exam.semester}</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Committee: {exam.committee.name}</Typography>
                            <Typography variant="body2">Session: {exam.committee.session}</Typography>
                        </Paper>
                    </Grid>

                    {/* Final Results */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TimelineIcon sx={{ mr: 1, color: '#025c53' }} />
                                <Typography variant="h6">Exam Results</Typography>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', mb: 4 }}>
                                <Box
                                    sx={{
                                        bgcolor: getGradeColor(exam.grade),
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 100,
                                        height: 100,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        mb: 1
                                    }}
                                >
                                    <Typography variant="h3" fontWeight="bold">
                                        {exam.grade && exam.grade.letter ? exam.grade.letter : 'N/A'}
                                    </Typography>
                                </Box>
                                <Typography variant="h6">
                                    Final Score: {exam.final_marks ? exam.final_marks.toFixed(2) : 'N/A'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', width: '45%' }}>
                                    <Typography variant="subtitle2" color="text.secondary">Internal (40)</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="primary">
                                        {exam.internal_marks.total.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Class Test 1: {exam.internal_marks.first_exam}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Class Test 2: {exam.internal_marks.second_exam}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Class Test 3: {exam.internal_marks.third_exam}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Attendance: {exam.internal_marks.attendance}
                                    </Typography>
                                </Paper>

                                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', width: '45%' }}>
                                    <Typography variant="subtitle2" color="text.secondary">External (100)</Typography>
                                    <Typography variant="h5" fontWeight="bold" color="secondary">
                                        {exam.external_marks.average.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        First Examiner: {exam.external_marks.first_examiner}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Second Examiner: {exam.external_marks.second_examiner}
                                    </Typography>
                                    {exam.external_marks.is_third_required && (
                                        <Typography variant="caption" display="block">
                                            Third Examiner: {exam.external_marks.third_examiner || 'Pending'}
                                        </Typography>
                                    )}
                                </Paper>
                            </Box>

                            <Box sx={{ textAlign: 'center' }}>
                                <Chip
                                    label={`Status: ${exam.status === 'completed' ? 'Completed' :
                                        exam.status === 'in_progress' ? 'In Progress' : 'Pending'}`}
                                    color={exam.status === 'completed' ? 'success' :
                                        exam.status === 'in_progress' ? 'warning' : 'error'}
                                    sx={{ px: 2 }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Examiners */}
                    <Grid item xs={12}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SchoolIcon sx={{ mr: 1, color: '#025c53' }} />
                                <Typography variant="h6">Examiners Information</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            First Examiner
                                        </Typography>
                                        <Typography variant="body2">{exam.examiners.first.name}</Typography>
                                        <Typography variant="body2">
                                            {exam.examiners.first.designation || 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Type: {exam.examiners.first.type === 'Teacher' ? 'Internal' : 'External'}
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="caption" display="block">
                                            Mark Submitted: {exam.external_marks.first_submitted_by ? 'Yes' : 'No'}
                                        </Typography>
                                        {exam.external_marks.first_submitted_by && (
                                            <Typography variant="caption" display="block">
                                                Submitted by: {exam.external_marks.first_submitted_by}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            Second Examiner
                                        </Typography>
                                        <Typography variant="body2">{exam.examiners.second.name}</Typography>
                                        <Typography variant="body2">
                                            {exam.examiners.second.designation || 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Type: {exam.examiners.second.type === 'Teacher' ? 'Internal' : 'External'}
                                        </Typography>
                                        <Divider sx={{ my: 1 }} />
                                        <Typography variant="caption" display="block">
                                            Mark Submitted: {exam.external_marks.second_submitted_by ? 'Yes' : 'No'}
                                        </Typography>
                                        {exam.external_marks.second_submitted_by && (
                                            <Typography variant="caption" display="block">
                                                Submitted by: {exam.external_marks.second_submitted_by}
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid>

                                {exam.examiners.third && (
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                Third Examiner
                                            </Typography>
                                            <Typography variant="body2">{exam.examiners.third.name}</Typography>
                                            <Typography variant="body2">
                                                {exam.examiners.third.designation || 'N/A'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Type: {exam.examiners.third.type === 'Teacher' ? 'Internal' : 'External'}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" display="block">
                                                Mark Submitted: {exam.external_marks.third_submitted_by ? 'Yes' : 'No'}
                                            </Typography>
                                            {exam.external_marks.third_submitted_by && (
                                                <Typography variant="caption" display="block">
                                                    Submitted by: {exam.external_marks.third_submitted_by}
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                )}

                                {!exam.examiners.third && exam.external_marks.is_third_required && (
                                    <Grid item xs={12} md={4}>
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff9c4' }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="warning.dark">
                                                Third Examiner Required
                                            </Typography>
                                            <Typography variant="body2">
                                                Due to mark difference between first and second examiner
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Status: Not yet assigned
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Internal Details */}
                    <Grid item xs={12}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <AssignmentIcon sx={{ mr: 1, color: '#025c53' }} />
                                <Typography variant="h6">Detailed Marks</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>Internal Evaluation (40%)</Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Component</TableCell>
                                            <TableCell>Mark</TableCell>
                                            <TableCell>Max</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Class Test 1</TableCell>
                                            <TableCell>{exam.internal_marks.first_exam || 0}</TableCell>
                                            <TableCell>10</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Class Test 2</TableCell>
                                            <TableCell>{exam.internal_marks.second_exam || 0}</TableCell>
                                            <TableCell>10</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Class Test 3</TableCell>
                                            <TableCell>{exam.internal_marks.third_exam || 0}</TableCell>
                                            <TableCell>10</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Attendance</TableCell>
                                            <TableCell>{exam.internal_marks.attendance || 0}</TableCell>
                                            <TableCell>10</TableCell>
                                        </TableRow>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><strong>Total</strong></TableCell>
                                            <TableCell><strong>{exam.internal_marks.total.toFixed(2)}</strong></TableCell>
                                            <TableCell><strong>40</strong></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                {exam.internal_marks.submitted_by && (
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                        Submitted by: {exam.internal_marks.submitted_by}
                                        at {formatDate(exam.internal_marks.submitted_at)}
                                    </Typography>
                                )}
                            </Box>

                            <Box>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>External Evaluation (60%)</Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Examiner</TableCell>
                                            <TableCell>Mark</TableCell>
                                            <TableCell>Submitted By</TableCell>
                                            <TableCell>Submission Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>First Examiner</TableCell>
                                            <TableCell>{exam.external_marks.first_examiner}</TableCell>
                                            <TableCell>{exam.external_marks.first_submitted_by || 'Not submitted'}</TableCell>
                                            <TableCell>{formatDate(exam.external_marks.first_submitted_at)}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Second Examiner</TableCell>
                                            <TableCell>{exam.external_marks.second_examiner}</TableCell>
                                            <TableCell>{exam.external_marks.second_submitted_by || 'Not submitted'}</TableCell>
                                            <TableCell>{formatDate(exam.external_marks.second_submitted_at)}</TableCell>
                                        </TableRow>
                                        {(exam.external_marks.is_third_required || exam.external_marks.third_examiner) && (
                                            <TableRow>
                                                <TableCell>Third Examiner</TableCell>
                                                <TableCell>{exam.external_marks.third_examiner || 'Pending'}</TableCell>
                                                <TableCell>
                                                    {exam.external_marks.third_submitted_by ||
                                                        (exam.external_marks.third_examiner_info ?
                                                            `${exam.external_marks.third_examiner_info.inferred_name} (inferred)` :
                                                            'Not submitted')}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(exam.external_marks.third_submitted_at) ||
                                                        (exam.external_marks.third_examiner > 0 ? 'Date not recorded' : 'Not available')}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><strong>Average</strong></TableCell>
                                            <TableCell colSpan={3}><strong>{exam.external_marks.average.toFixed(2)} / 100</strong></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>

                                {exam.external_marks.is_third_required && (
                                    <Chip
                                        label="Third examiner required due to mark difference"
                                        color="warning"
                                        sx={{ mt: 2 }}
                                    />
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}