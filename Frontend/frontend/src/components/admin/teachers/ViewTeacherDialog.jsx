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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WorkIcon from '@mui/icons-material/Work';
import { format } from 'date-fns';

export default function ViewTeacherDialog({ open, onClose, teacher }) {
    if (!teacher) return null;

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Teacher Details
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
                                bgcolor: '#025c53',
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
                                    <Typography variant="body1">{teacher.phone_number}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AccountBalanceIcon sx={{ color: '#025c53', mr: 2 }} />
                                    <Typography variant="body1">
                                        Department: {teacher.department_id?.name || 'Not specified'}
                                        {teacher.department_id?.faculty_id && ` (${teacher.department_id.faculty_id.name})`}
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
                            Joined: {teacher.createdAt
                                ? format(new Date(teacher.createdAt), 'PPP')
                                : 'Unknown'
                            }
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            Last Updated: {teacher.updatedAt
                                ? format(new Date(teacher.updatedAt), 'PPP')
                                : 'Unknown'
                            }
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