import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    CircularProgress,
    Alert,
    Paper,
    Tab,
    Tabs,
    Divider
} from '@mui/material';
import api from '@/services/api';
import ExamFilter from '@/components/admin/exams/ExamFilter';
import ExamResultsTable from '@/components/admin/exams/ExamResultsTable';
import ExamDetailsDialog from '@/components/admin/exams/ExamDetailsDialog';
import { FormatListBulleted, GridView } from '@mui/icons-material';
import CourseGroupedView from '@/components/admin/exams/CourseGroupedView';

export default function MonitorExamManagement() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fetchedData, setFetchedData] = useState({
        individual_data: [],
        grouped_data: []
    });

    // References for the filter
    const [examCommittees, setExamCommittees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);

    // Filter state
    const [filterParams, setFilterParams] = useState({
        committee_id: '',
        course_id: '',
        student_id: '',
        semester_id: '',
        session_id: '',
        department_id: ''
    });

    // Detail view state
    const [selectedExam, setSelectedExam] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // View type state (individual or grouped)
    const [viewType, setViewType] = useState(0); // 0 for individual, 1 for grouped

    // Get reference data for filters
    useEffect(() => {
        const fetchReferenceData = async () => {
            try {
                const [
                    committeesRes,
                    departmentsRes,
                    sessionsRes,
                    semestersRes,
                    coursesRes
                ] = await Promise.all([
                    api.get('/admin/exam-committee'),
                    api.get('/admin/department'),
                    api.get('/admin/session'),
                    api.get('/admin/semester'),
                    api.get('/admin/course')
                ]);

                setExamCommittees(committeesRes.data.examCommittees);
                setDepartments(departmentsRes.data.departments);
                setSessions(sessionsRes.data.sessions);
                setSemesters(semestersRes.data.semesters);
                setCourses(coursesRes.data.courses);
            } catch (err) {
                setError('Failed to load reference data. Please refresh the page.');
                console.error('Error fetching reference data:', err);
            }
        };

        fetchReferenceData();
    }, []);

    // Fetch exam data based on filters
    const fetchExamData = async (params = {}) => {
        try {
            setLoading(true);
            setError(null);

            // Build URL with query parameters
            const queryParams = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const url = `/admin/comprehensive-exam-data${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            const response = await api.get(url);
            if (response.data.success) {
                setFetchedData({
                    individual_data: response.data.individual_data || [],
                    grouped_data: response.data.grouped_data || []
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load exam data');
            console.error('Error fetching exam data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchExamData();
    }, []);

    // Apply filters
    const handleApplyFilters = () => {
        fetchExamData(filterParams);
    };

    // Reset filters
    const handleResetFilters = () => {
        setFilterParams({
            committee_id: '',
            course_id: '',
            student_id: '',
            semester_id: '',
            session_id: '',
            department_id: ''
        });
        fetchExamData();
    };

    // Search students
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

    // View exam details
    const handleViewExamDetails = (exam) => {
        setSelectedExam(exam);
        setIsDetailsOpen(true);
    };

    return (
        <Container maxWidth="xl">
            <Box sx={{ mt: 3, mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Monitor Exams
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Track and monitor exam status, marks, and results
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <ExamFilter
                    committees={examCommittees}
                    departments={departments}
                    sessions={sessions}
                    semesters={semesters}
                    courses={courses}
                    students={students}
                    filterParams={filterParams}
                    setFilterParams={setFilterParams}
                    onSearchStudents={handleSearchStudents}
                    onApplyFilters={handleApplyFilters}
                    onResetFilters={handleResetFilters}
                />

                <Paper sx={{ mb: 3 }}>
                    <Tabs
                        value={viewType}
                        onChange={(_, newValue) => setViewType(newValue)}
                        sx={{ px: 2, pt: 1 }}
                    >
                        <Tab
                            icon={<FormatListBulleted />}
                            label="Individual View"
                            iconPosition="start"
                        />
                        <Tab
                            icon={<GridView />}
                            label="Course Grouped View"
                            iconPosition="start"
                        />
                    </Tabs>
                    <Divider />

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                            <CircularProgress sx={{ color: '#025c53' }} />
                        </Box>
                    ) : viewType === 0 ? (
                        <ExamResultsTable
                            exams={fetchedData.individual_data}
                            onViewDetails={handleViewExamDetails}
                        />
                    ) : (
                        <CourseGroupedView
                            groupedData={fetchedData.grouped_data}
                            onViewDetails={handleViewExamDetails}
                        />
                    )}
                </Paper>
            </Box>

            <ExamDetailsDialog
                open={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                exam={selectedExam}
            />
        </Container>
    );
}