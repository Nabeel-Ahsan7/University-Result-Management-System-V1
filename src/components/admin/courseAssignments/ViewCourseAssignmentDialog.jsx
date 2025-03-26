import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Divider,
    Grid,
    Box,
    Chip,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Card,
    CardContent
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import BookIcon from '@mui/icons-material/Book';
import ClassIcon from '@mui/icons-material/Class';
import PersonIcon from '@mui/icons-material/Person';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EventIcon from '@mui/icons-material/Event';
import DomainIcon from '@mui/icons-material/Domain';

export default function ViewCourseAssignmentDialog({ open, onClose, assignment }) {
    if (!assignment) return null;

    // Format date using native JavaScript
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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

    const renderExaminer = (examiner, type, icon, title) => {
        if (!examiner) return null;

        return (
            <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                            {title}
                        </Typography>
                        <Chip
                            label={type}
                            size="small"
                            sx={{
                                ml: 2,
                                bgcolor: getExaminerColor(type),
                                color: 'white'
                            }}
                        />
                    </Box>

                    <Typography variant="body1" fontWeight="bold">
                        {examiner.name}
                    </Typography>

                    {examiner.email && (
                        <Typography variant="body2" color="text.secondary">
                            Email: {examiner.email}
                        </Typography>
                    )}

                    {examiner.designation && (
                        <Typography variant="body2" color="text.secondary">
                            Designation: {examiner.designation}
                        </Typography>
                    )}

                    {examiner.university_name && (
                        <Typography variant="body2" color="text.secondary">
                            University: {examiner.university_name}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#025c53', color: 'white' }}>
                Course Assignment Details
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <BookIcon sx={{ color: '#025c53', mr: 1 }} />
                                <Typography variant="h6">Course Information</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="body1" fontWeight="bold">
                                {assignment.course_id?.course_code} - {assignment.course_id?.course_name}
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Credit Hours: {assignment.course_id?.credit}
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Department: {assignment.course_id?.department_id?.name}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SupervisorAccountIcon sx={{ color: '#025c53', mr: 1 }} />
                                <Typography variant="h6">Committee Information</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <EventIcon sx={{ color: '#025c53' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Committee"
                                        secondary={assignment.exam_committee_id?.name}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <DomainIcon sx={{ color: '#025c53' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Department"
                                        secondary={assignment.exam_committee_id?.department_id?.name}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <EventIcon sx={{ color: '#025c53' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Session"
                                        secondary={assignment.exam_committee_id?.session_id?.name}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <ClassIcon sx={{ color: '#025c53' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Semester"
                                        secondary={assignment.semester_id?.name}
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <PersonIcon sx={{ color: '#025c53', mr: 1 }} />
                                <Typography variant="h6">Timing Information</Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Created: {formatDate(assignment.createdAt)}
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Last Updated: {formatDate(assignment.updatedAt)}
                            </Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <SchoolIcon sx={{ color: '#025c53', mr: 1 }} />
                            <Typography variant="h6">Examiners</Typography>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {renderExaminer(
                            assignment.first_examiner_id,
                            assignment.first_examiner_type,
                            <PersonIcon sx={{ color: '#4caf50' }} />,
                            "First Examiner"
                        )}

                        {renderExaminer(
                            assignment.second_examiner_id,
                            assignment.second_examiner_type,
                            <PersonIcon sx={{ color: '#2196f3' }} />,
                            "Second Examiner"
                        )}

                        {assignment.third_examiner_id && renderExaminer(
                            assignment.third_examiner_id,
                            assignment.third_examiner_type,
                            <PersonIcon sx={{ color: '#ff9800' }} />,
                            "Third Examiner"
                        )}
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                    sx={{ color: '#025c53' }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}