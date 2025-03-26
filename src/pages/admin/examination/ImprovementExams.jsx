import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    CircularProgress,
    Alert,
    Paper,
    Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '@/services/api';
import ImprovementExamTable from '@/components/admin/improvementExams/ImprovementExamTable';
import ImprovementExamFilter from '@/components/admin/improvementExams/ImprovementExamFilter';
import AddImprovementExamDialog from '@/components/admin/improvementExams/AddImprovementExamDialog';

export default function ImprovementExamManagement() {
    const [improvementExams, setImprovementExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // References for filter
    const [examCommittees, setExamCommittees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [courseAssignments, setCourseAssignments] = useState([]);
    const [students, setStudents] = useState([]);

    // Filter state
    const [filterParams, setFilterParams] = useState({
        committee_id: '',
        course_assignment_id: '',
        student_id: ''
    });

    // Load reference data for filters and form
    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                const [
                    committeesRes,
                    departmentsRes,
                    sessionsRes,
                    courseAssignmentsRes
                ] = await Promise.all([
                    api.get('/admin/exam-committee'),
                    api.get('/admin/department'),
                    api.get('/admin/session'),
                    api.get('/admin/course-assignment')
                ]);

                setExamCommittees(committeesRes.data.examCommittees);
                setDepartments(departmentsRes.data.departments);
                setSessions(sessionsRes.data.sessions);
                setCourseAssignments(courseAssignmentsRes.data.courseAssignments);
            } catch (err) {
                console.error('Error fetching reference data:', err);
                setError('Failed to load reference data. Please try again.');
            }
        };

        fetchReferenceData();
    }, []);

    // Fetch improvement exams based on filters
    const fetchImprovementExams = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const url = `/admin/improvement-exam${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await api.get(url);

            if (response.data.success) {
                setImprovementExams(response.data.exams || []);
            } else {
                setError(response.data.message || 'Failed to fetch improvement exams');
            }
        } catch (err) {
            console.error('Error fetching improvement exams:', err);
            setError(err.response?.data?.message || 'Failed to load improvement exams');
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchImprovementExams();
    }, []);

    // Apply filters
    const handleApplyFilters = () => {
        fetchImprovementExams(filterParams);
    };

    // Reset filters
    const handleResetFilters = () => {
        setFilterParams({
            committee_id: '',
            course_assignment_id: '',
            student_id: ''
        });
        fetchImprovementExams();
    };

    // Add new improvement exam
    const handleAddImprovementExam = async (formData) => {
        try {
            setLoading(true);
            const response = await api.post('/admin/improvement-exam', formData);

            if (response.data.success) {
                // Refresh the list
                fetchImprovementExams(filterParams);
                setIsFormOpen(false);
                return { success: true };
            } else {
                setError(response.data.message || 'Failed to add improvement exam');
                return { success: false, error: response.data.message };
            }
        } catch (err) {
            console.error('Error adding improvement exam:', err);
            const errorMessage = err.response?.data?.message || 'Failed to add improvement exam';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Delete improvement exam
    const handleDeleteImprovementExam = async (id) => {
        if (!window.confirm('Are you sure you want to delete this improvement exam?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await api.delete(`/admin/improvement-exam/${id}`);

            if (response.data.success) {
                // Refresh the list
                fetchImprovementExams(filterParams);
            } else {
                setError(response.data.message || 'Failed to delete improvement exam');
            }
        } catch (err) {
            console.error('Error deleting improvement exam:', err);
            setError(err.response?.data?.message || 'Failed to delete improvement exam');
        } finally {
            setLoading(false);
        }
    };

    // Search students by name, registration number, or roll number
    const handleSearchStudents = async (query) => {
        if (!query || query.length < 3) {
            setStudents([]);
            return;
        }

        try {
            const response = await api.get(`/admin/student/search?query=${query}`);
            if (response.data.success) {
                setStudents(response.data.students);
            }
        } catch (error) {
            console.error('Error searching students:', error);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Improvement Exam Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsFormOpen(true)}
                        sx={{ bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                    >
                        Add Improvement Exam
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <ImprovementExamFilter
                    filterParams={filterParams}
                    setFilterParams={setFilterParams}
                    examCommittees={examCommittees}
                    courseAssignments={courseAssignments}
                    students={students}
                    onSearchStudents={handleSearchStudents}
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
                />

                <Paper sx={{ mt: 3 }}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6">Improvement Exams</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Showing {improvementExams.length} improvement exam(s)
                        </Typography>
                    </Box>
                    <Divider />

                    {loading && improvementExams.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                            <CircularProgress sx={{ color: '#025c53' }} />
                        </Box>
                    ) : (
                        <ImprovementExamTable
                            improvementExams={improvementExams}
                            onDelete={handleDeleteImprovementExam}
                            loading={loading}
                        />
                    )}
                </Paper>
            </Box>

            <AddImprovementExamDialog
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleAddImprovementExam}
                examCommittees={examCommittees}
                courseAssignments={courseAssignments}
                departments={departments}
                students={students}
                onSearchStudents={handleSearchStudents}
            />
        </Container>
    );
}