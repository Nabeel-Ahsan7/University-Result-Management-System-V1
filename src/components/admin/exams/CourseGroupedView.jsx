import React, { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Chip,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Divider,
    Grid,
    IconButton,
    Tooltip,
    Badge
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Visibility as VisibilityIcon,
    School as SchoolIcon,
    LibraryBooks as LibraryBooksIcon,
    Person as PersonIcon
} from '@mui/icons-material';

export default function CourseGroupedView({ groupedData, onViewDetails }) {
    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    // Helper to count students with complete marks
    const getCompletionStats = (students) => {
        const total = students.length;
        const internalComplete = students.filter(s =>
            s.internal_marks.submitted_by !== undefined &&
            s.internal_marks.submitted_by !== null
        ).length;

        const externalComplete = students.filter(s => {
            const marks = s.external_marks;
            if (marks.is_third_required) {
                return marks.first_submitted_by && marks.second_submitted_by && marks.third_submitted_by;
            }
            return marks.first_submitted_by && marks.second_submitted_by;
        }).length;

        return { total, internalComplete, externalComplete };
    };

    // Calculate grade distribution
    const getGradeDistribution = (students) => {
        const distribution = {
            'A+': 0, 'A': 0, 'A-': 0,
            'B+': 0, 'B': 0, 'B-': 0,
            'C+': 0, 'C': 0, 'D': 0, 'F': 0
        };

        students.forEach(student => {
            // Access the letter property of the grade object
            if (student.grade && student.grade.letter && distribution.hasOwnProperty(student.grade.letter)) {
                distribution[student.grade.letter]++;
            }
        });

        return distribution;
    };

    if (groupedData.length === 0) {
        return (
            <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No data available
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            {groupedData.map((group, index) => {
                const stats = getCompletionStats(group.students);
                const gradeDistribution = getGradeDistribution(group.students);

                return (
                    <Accordion
                        key={index}
                        expanded={expanded === `panel${index}`}
                        onChange={handleChange(`panel${index}`)}
                        sx={{ mb: 2, border: '1px solid #e0e0e0' }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Grid container alignItems="center" spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <LibraryBooksIcon sx={{ mr: 1, color: '#025c53' }} />
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {group.course.code} - {group.course.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Credit: {group.course.credit} | {group.semester}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={6} md={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <SchoolIcon sx={{ mr: 1, color: '#1976d2' }} />
                                        <Box>
                                            <Typography variant="body2">
                                                {group.committee.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {group.committee.session}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs={6} md={2}>
                                    <Typography variant="body2">
                                        <strong>Students:</strong> {group.students.length}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip
                                            label={`${stats.internalComplete}/${stats.total}`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={`${stats.externalComplete}/${stats.total}`}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                            Grades:
                                        </Typography>
                                        {Object.entries(gradeDistribution).map(([grade, count]) =>
                                            count > 0 && (
                                                <Chip
                                                    key={grade}
                                                    label={`${grade}: ${count}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: grade.startsWith('A') ? '#4caf50' :
                                                            grade.startsWith('B') ? '#2196f3' :
                                                                grade.startsWith('C') ? '#ff9800' :
                                                                    grade === 'D' ? '#ff5722' : '#f44336',
                                                        color: 'white',
                                                        fontSize: '0.7rem',
                                                        height: 20
                                                    }}
                                                />
                                            )
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </AccordionSummary>

                        <Divider />

                        <AccordionDetails sx={{ p: 0 }}>
                            <Paper elevation={0}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Internal (40)</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>External (100)</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Final</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {group.students.map((student, idx) => {
                                            const internalComplete = student.internal_marks.submitted_by !== undefined;
                                            const externalComplete = student.external_marks.first_submitted_by &&
                                                student.external_marks.second_submitted_by &&
                                                (!student.external_marks.is_third_required ||
                                                    student.external_marks.third_submitted_by);

                                            return (
                                                <TableRow key={idx} hover>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <PersonIcon sx={{ mr: 1, color: '#757575', fontSize: '1rem' }} />
                                                            <Box>
                                                                <Typography variant="body2">
                                                                    {student.student.name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Roll: {student.student.roll_number}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={student.student.type === 'regular' ? 'Regular' : 'Improve'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: student.student.type === 'regular' ? '#e3f2fd' : '#fce4ec',
                                                                color: student.student.type === 'regular' ? '#1565c0' : '#c2185b'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            color={internalComplete ? "success" : "error"}
                                                            variant="dot"
                                                        >
                                                            <Typography variant="body2">
                                                                {student.internal_marks.total.toFixed(2)}
                                                            </Typography>
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            color={externalComplete ? "success" : "error"}
                                                            variant="dot"
                                                        >
                                                            <Typography variant="body2">
                                                                {student.external_marks.average.toFixed(2)}
                                                            </Typography>
                                                        </Badge>
                                                        {student.external_marks.is_third_required && (
                                                            <Chip
                                                                label="Third"
                                                                size="small"
                                                                color="warning"
                                                                sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {student.final_marks.toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={student.grade.letter}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: student.grade.letter.startsWith('A') ? '#4caf50' :
                                                                    student.grade.letter.startsWith('B') ? '#2196f3' :
                                                                        student.grade.letter.startsWith('C') ? '#ff9800' :
                                                                            student.grade.letter === 'D' ? '#ff5722' : '#f44336',
                                                                color: 'white'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="View Details">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    // Reconstruct the full exam object for the detail view
                                                                    const fullExam = {
                                                                        exam_id: student.exam_id,
                                                                        committee: group.committee,
                                                                        course: group.course,
                                                                        semester: group.semester,
                                                                        examiners: group.examiners,
                                                                        student: student.student,
                                                                        internal_marks: student.internal_marks,
                                                                        external_marks: student.external_marks,
                                                                        final_marks: student.final_marks,
                                                                        grade: student.grade, // This is fine as we're just passing the object, not rendering it
                                                                        status: student.status
                                                                    };
                                                                    onViewDetails(fullExam);
                                                                }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </Paper>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
}