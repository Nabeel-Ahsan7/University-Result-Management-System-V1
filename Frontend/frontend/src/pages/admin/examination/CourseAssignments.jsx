import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '@/services/api';
import CourseAssignmentTable from '@/components/admin/courseAssignments/CourseAssignmentTable';
import CourseAssignmentFilter from '@/components/admin/courseAssignments/CourseAssignmentFilter';
import CourseAssignmentForm from '@/components/admin/courseAssignments/CourseAssignmentForm';
import ViewCourseAssignmentDialog from '@/components/admin/courseAssignments/ViewCourseAssignmentDialog';

export default function CourseAssignmentManagement() {
    const [courseAssignments, setCourseAssignments] = useState([]);
    const [examCommittees, setExamCommittees] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [externalTeachers, setExternalTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [searchParams, setSearchParams] = useState({
        exam_committee_id: '',
        semester_id: '',
        course_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [
                assignmentsRes,
                committeesRes,
                semestersRes,
                coursesRes,
                teachersRes,
                externalTeachersRes
            ] = await Promise.all([
                api.get('/admin/course-assignment'),
                api.get('/admin/exam-committee'),
                api.get('/admin/semester'),
                api.get('/admin/course'),
                api.get('/admin/teacher'),
                api.get('/admin/external-teacher')
            ]);

            setCourseAssignments(assignmentsRes.data.courseAssignments);
            setExamCommittees(committeesRes.data.examCommittees);
            setSemesters(semestersRes.data.semesters);
            setCourses(coursesRes.data.courses);
            setTeachers(teachersRes.data.teachers);
            setExternalTeachers(externalTeachersRes.data.externalTeachers);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            setError(null);

            let url = '/admin/course-assignment';
            const params = new URLSearchParams();

            if (searchParams.exam_committee_id) params.append('exam_committee_id', searchParams.exam_committee_id);
            if (searchParams.semester_id) params.append('semester_id', searchParams.semester_id);
            if (searchParams.course_id) params.append('course_id', searchParams.course_id);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);
            setCourseAssignments(response.data.courseAssignments);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search course assignments');
            console.error('Error searching course assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedAssignment(null);
        setEditMode(false);
        setIsFormOpen(true);
    };

    const handleEdit = (assignment) => {
        setSelectedAssignment(assignment);
        setEditMode(true);
        setIsFormOpen(true);
    };

    const handleView = (assignment) => {
        setSelectedAssignment(assignment);
        setIsViewDialogOpen(true);
    };

    const handleDelete = (assignment) => {
        setSelectedAssignment(assignment);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/admin/course-assignment/${selectedAssignment._id}`);
            fetchData();
            setIsDeleteDialogOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete course assignment');
            console.error('Error deleting course assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveAssignment = async (assignmentData) => {
        try {
            setLoading(true);
            if (editMode) {
                await api.put(`/admin/course-assignment/${selectedAssignment._id}`, assignmentData);
            } else {
                await api.post('/admin/course-assignment', assignmentData);
            }
            fetchData();
            setIsFormOpen(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} course assignment`);
            console.error(`Error ${editMode ? 'updating' : 'creating'} course assignment:`, err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Course Assignment Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        sx={{ bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                    >
                        Add Course Assignment
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <CourseAssignmentFilter
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                    examCommittees={examCommittees}
                    semesters={semesters}
                    courses={courses}
                    onSearch={handleSearch}
                    onReset={fetchData}
                />

                {loading && !courseAssignments.length ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress sx={{ color: '#025c53' }} />
                    </Box>
                ) : (
                    <CourseAssignmentTable
                        courseAssignments={courseAssignments}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        loading={loading}
                    />
                )}
            </Box>

            <CourseAssignmentForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={saveAssignment}
                assignment={selectedAssignment}
                examCommittees={examCommittees}
                semesters={semesters}
                courses={courses}
                teachers={teachers}
                externalTeachers={externalTeachers}
                editMode={editMode}
            />

            <ViewCourseAssignmentDialog
                open={isViewDialogOpen}
                onClose={() => setIsViewDialogOpen(false)}
                assignment={selectedAssignment}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this course assignment? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}