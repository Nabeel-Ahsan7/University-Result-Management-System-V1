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
    ListItemIcon
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MessageIcon from '@mui/icons-material/Message';

export default function ViewExamCommitteeDialog({ open, onClose, committee }) {
    if (!committee) return null;

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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: '#025c53', color: 'white' }}>
                {committee.name} - Exam Committee Details
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Committee Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <CalendarTodayIcon sx={{ color: '#025c53' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Session"
                                        secondary={committee.session_id?.name || 'N/A'}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <AccountBalanceIcon sx={{ color: '#025c53' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Department"
                                        secondary={committee.department_id?.name || 'N/A'}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <SchoolIcon sx={{ color: '#025c53' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Semesters"
                                        secondary={
                                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {committee.semesters?.map(semester => (
                                                    <Chip
                                                        key={semester._id || semester}
                                                        label={semester.name || semester}
                                                        size="small"
                                                        sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                                                    />
                                                ))}
                                            </Box>
                                        }
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        {committee.is_active ?
                                            <CheckCircleIcon sx={{ color: 'success.main' }} /> :
                                            <CancelIcon sx={{ color: 'text.disabled' }} />
                                        }
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Status"
                                        secondary={committee.is_active ? 'Active' : 'Inactive'}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <MessageIcon sx={{ color: '#025c53' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Marks Publication Status"
                                        secondary={
                                            <Box sx={{ mt: 1 }}>
                                                <Chip
                                                    label={committee.internal_marks_published ? 'Published' : 'Not Published'}
                                                    size="small"
                                                    sx={{
                                                        mr: 1,
                                                        bgcolor: committee.internal_marks_published ? '#e8f5e9' : '#ffebee',
                                                        color: committee.internal_marks_published ? '#2e7d32' : '#c62828'
                                                    }}
                                                />
                                                <Typography variant="caption" sx={{ mr: 1 }}>
                                                    Internal Marks
                                                </Typography>

                                                <Chip
                                                    label={committee.external_marks_published ? 'Published' : 'Not Published'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: committee.external_marks_published ? '#e8f5e9' : '#ffebee',
                                                        color: committee.external_marks_published ? '#2e7d32' : '#c62828'
                                                    }}
                                                />
                                                <Typography variant="caption">
                                                    External Marks
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                            <Typography variant="h6" gutterBottom color="primary">
                                Committee Members
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <List dense>
                                <ListItem>
                                    <ListItemIcon>
                                        <PersonIcon sx={{ color: '#9c27b0' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Committee President"
                                        secondary={
                                            <>
                                                <Typography variant="body2" component="span">
                                                    {committee.president_id?.name || 'N/A'}
                                                </Typography>
                                                {committee.president_id?.designation && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {committee.president_id.designation}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <GroupIcon sx={{ color: '#2196f3' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Committee Member 1"
                                        secondary={
                                            <>
                                                <Typography variant="body2" component="span">
                                                    {committee.member_1_id?.name || 'N/A'}
                                                </Typography>
                                                {committee.member_1_id?.designation && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {committee.member_1_id.designation}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <GroupIcon sx={{ color: '#ff9800' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Committee Member 2 (External)"
                                        secondary={
                                            <>
                                                <Typography variant="body2" component="span">
                                                    {committee.member_2_id?.name || 'N/A'}
                                                </Typography>
                                                {committee.member_2_id?.university_name && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {committee.member_2_id.university_name}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                Created: {formatDate(committee.createdAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                                Last Updated: {formatDate(committee.updatedAt)}
                            </Typography>
                        </Box>
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