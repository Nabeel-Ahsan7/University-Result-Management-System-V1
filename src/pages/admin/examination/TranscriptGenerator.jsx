import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Alert, CircularProgress, Divider } from '@mui/material';
import TranscriptGeneratorComponent from '../../../components/admin/transcripts/TranscriptGenerator';
import api, { adminService } from '../../../services/api';
import { generateStudentTranscriptPDF } from '../../../utils/pdfGenerators';

export default function TranscriptGeneratorPage() {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [departments, setDepartments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [committees, setCommittees] = useState([]);
    const [semesters, setSemesters] = useState([]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setInitialLoading(true);

                // Use adminService methods
                const departmentsResponse = await adminService.getDepartments();
                const sessionsResponse = await adminService.getSessions();
                const committeesResponse = await adminService.getExamCommittees();
                const semestersResponse = await adminService.getSemesters();

                // Debug logs
                console.log('Departments response:', departmentsResponse.data);
                console.log('Sessions response:', sessionsResponse.data);
                console.log('Committees response:', committeesResponse.data);
                console.log('Semesters response:', semestersResponse.data);

                // Set state based on actual response structure
                setDepartments(departmentsResponse.data.departments || []);
                setSessions(sessionsResponse.data.sessions || []);
                setCommittees(committeesResponse.data.examCommittees || []); // Changed from committees to examCommittees
                setSemesters(semestersResponse.data.semesters || []);

            } catch (err) {
                console.error('Error fetching initial data:', err);
                setError('Failed to load required data. Please refresh the page.');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleGenerateTranscript = async (params) => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            console.log('Requesting transcript with params:', params);

            // Use your api instance with interceptors
            const response = await api.get('/admin/student-transcript', {
                params: {
                    committeeId: params.committeeId,
                    semesterId: params.semesterId,
                    studentId: params.studentId
                }
            });

            console.log('Full transcript response:', response.data);

            if (response.data.success) {
                console.log('Committee data:', response.data.committee);
                console.log('Semester data:', response.data.semester);
                console.log('Student data:', response.data.student);
                console.log('Results data:', response.data.results);

                // Map API response to format expected by PDF generator
                // This ensures compatibility with both admin and teacher sections
                const formattedData = {
                    committee: {
                        department: response.data.committee.department,
                        session: response.data.committee.session,
                        name: response.data.committee.name,
                    },
                    semester: {
                        name: response.data.semester.name,
                        _id: response.data.semester._id
                    },
                    student: {
                        name: response.data.student.name,
                        roll_number: response.data.student.roll_number,
                        registration_number: response.data.student.registration_number
                    },
                    results: response.data.results
                };

                // Use the existing PDF generator with the formatted data
                const result = generateStudentTranscriptPDF(
                    formattedData.committee,
                    formattedData.semester,
                    formattedData.results,
                    formattedData.student
                );

                if (result) {
                    setSuccess('Transcript generated successfully and downloaded!');
                } else {
                    setError('Failed to generate PDF');
                }
            } else {
                setError(response.data.message || 'Failed to generate transcript');
            }
        } catch (err) {
            console.error('Error generating transcript:', err);
            setError('An error occurred while generating the transcript');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ color: '#025c53' }}>
                    Student Transcript Generator
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Generate individual academic transcripts for students
                </Typography>

                <Divider sx={{ mb: 3 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <TranscriptGeneratorComponent
                    departments={departments}
                    sessions={sessions}
                    committees={committees}
                    semesters={semesters}
                    onGenerateTranscript={handleGenerateTranscript}
                    loading={loading}
                />
            </Box>
        </Container>
    );
}
