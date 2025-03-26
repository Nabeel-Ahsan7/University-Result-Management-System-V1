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
    Avatar
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BadgeIcon from '@mui/icons-material/Badge';

export default function ViewStudentDialog({ open, onClose, student }) {
    if (!student) return null;

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

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
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Student Details
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar
                            sx={{
                                width: 120,
                                height: 120,
                                bgcolor: '#025c53',
                                fontSize: '2.5rem',
                                mb: 2
                            }}
                        >
                            {getInitials(student.name)}
                        </Avatar>

                        <Chip
                            label={student.type.charAt(0).toUpperCase() + student.type.slice(1)}
                            color="primary"
                            sx={{
                                bgcolor: getTypeColor(student.type),
                                px: 1,
                                py: 3,
                                fontSize: '0.9rem',
                                fontWeight: 'medium'
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={8} md={9}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {student.name}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <EmailIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">{student.email}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <BadgeIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">
                                        Registration: {student.registration_number} | Roll: {student.roll_number}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AccountBalanceIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">
                                        Department: {student.department_id?.name || 'Not specified'}
                                        {student.department_id?.faculty_id && ` (${student.department_id.faculty_id.name})`}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SchoolIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">
                                        Admission Session: {student.admission_session_id?.name || 'Not specified'}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <CalendarTodayIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">
                                        Current Session: {student.current_session_id?.name || 'Not specified'}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2" color="text.secondary">
                            Joined: {formatDate(student.createdAt)}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Last Updated: {formatDate(student.updatedAt)}
                        </Typography>
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