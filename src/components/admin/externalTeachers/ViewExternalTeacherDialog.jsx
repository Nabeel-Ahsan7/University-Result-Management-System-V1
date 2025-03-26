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
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';

export default function ViewExternalTeacherDialog({ open, onClose, teacher }) {
    if (!teacher) return null;

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

    const getDesignationColor = (designation) => {
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
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                External Teacher Details
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
                            {getInitials(teacher.name)}
                        </Avatar>

                        <Chip
                            label={teacher.designation}
                            color="primary"
                            sx={{
                                bgcolor: getDesignationColor(teacher.designation),
                                px: 1,
                                py: 3,
                                fontSize: '0.9rem',
                                fontWeight: 'medium'
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={8} md={9}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            {teacher.name}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <EmailIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">{teacher.email}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <PhoneIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">{teacher.phone}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <SchoolIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">
                                        University: {teacher.university_name}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <BusinessIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">
                                        Department: {teacher.department}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <WorkIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">
                                        Designation: {teacher.designation}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body2" color="text.secondary">
                            Joined: {formatDate(teacher.createdAt)}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Last Updated: {formatDate(teacher.updatedAt)}
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