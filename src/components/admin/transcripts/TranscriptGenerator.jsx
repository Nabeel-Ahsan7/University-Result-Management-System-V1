import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem, Button, Paper, Grid, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { adminService } from '../../../services/api';

const TranscriptGenerator = ({
    departments,
    sessions,
    committees,
    semesters,
    onGenerateTranscript,
    loading
}) => {
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedSession, setSelectedSession] = useState('');
    const [selectedCommittee, setSelectedCommittee] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Filter committees based on department and session
    const filteredCommittees = committees.filter(committee => {
        return (!selectedDepartment || committee.department_id?._id === selectedDepartment) &&
            (!selectedSession || committee.session_id?._id === selectedSession);
    });

    // Filter semesters based on selected committee
    const filteredSemesters = selectedCommittee
        ? semesters.filter(semester => {
            const committee = committees.find(c => c._id === selectedCommittee);
            return committee && committee.semesters &&
                committee.semesters.some(s => s._id === semester._id);
        })
        : [];

    // Reset downstream selections when upstream selection changes
    useEffect(() => {
        setSelectedCommittee('');
        setSelectedSemester('');
        setSelectedStudent('');
    }, [selectedDepartment, selectedSession]);

    useEffect(() => {
        setSelectedSemester('');
        setSelectedStudent('');
    }, [selectedCommittee]);

    useEffect(() => {
        setSelectedStudent('');
    }, [selectedSemester]);

    // Fetch students when semester is selected
    useEffect(() => {
        if (selectedSemester && selectedCommittee) {
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedSemester, selectedCommittee]);

    // Update the fetchStudents function with logging
    const fetchStudents = async () => {
        try {
            setLoadingStudents(true);
            console.log(`Fetching students for committee: ${selectedCommittee}, semester: ${selectedSemester}`);

            // Use the adminService method to fetch students from your API
            const response = await adminService.getStudentsByCommitteeAndSemester(selectedCommittee, selectedSemester);
            console.log('Students response:', response.data);

            if (response.data.success) {
                setStudents(response.data.students || []);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleGenerateTranscript = () => {
        if (selectedStudent && selectedSemester && selectedCommittee) {
            onGenerateTranscript({
                committeeId: selectedCommittee,
                semesterId: selectedSemester,
                studentId: selectedStudent
            });
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#025c53' }}>
                Generate Student Transcript
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Department</InputLabel>
                        <Select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            label="Department"
                        >
                            <MenuItem value="">All Departments</MenuItem>
                            {departments.map(dept => (
                                <MenuItem key={dept._id} value={dept._id}>
                                    {dept.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Session</InputLabel>
                        <Select
                            value={selectedSession}
                            onChange={(e) => setSelectedSession(e.target.value)}
                            label="Session"
                        >
                            <MenuItem value="">All Sessions</MenuItem>
                            {sessions.map(session => (
                                <MenuItem key={session._id} value={session._id}>
                                    {session.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Exam Committee</InputLabel>
                        <Select
                            value={selectedCommittee}
                            onChange={(e) => setSelectedCommittee(e.target.value)}
                            label="Exam Committee"
                            disabled={filteredCommittees.length === 0}
                        >
                            <MenuItem value="">Select Committee</MenuItem>
                            {filteredCommittees.map(committee => (
                                <MenuItem key={committee._id} value={committee._id}>
                                    {committee.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Semester</InputLabel>
                        <Select
                            value={selectedSemester}
                            onChange={(e) => setSelectedSemester(e.target.value)}
                            label="Semester"
                            disabled={!selectedCommittee}
                        >
                            <MenuItem value="">Select Semester</MenuItem>
                            {filteredSemesters.map(semester => (
                                <MenuItem key={semester._id} value={semester._id}>
                                    {semester.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Student</InputLabel>
                        <Select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            label="Student"
                            disabled={!selectedSemester || loadingStudents}
                        >
                            <MenuItem value="">Select Student</MenuItem>
                            {students.map(student => (
                                <MenuItem key={student._id} value={student._id}>
                                    {student.roll_number} - {student.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                            onClick={handleGenerateTranscript}
                            disabled={!selectedStudent || loading}
                            sx={{
                                bgcolor: '#025c53',
                                '&:hover': { bgcolor: '#01413a' }
                            }}
                        >
                            {loading ? 'Generating...' : 'Generate Transcript'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TranscriptGenerator;