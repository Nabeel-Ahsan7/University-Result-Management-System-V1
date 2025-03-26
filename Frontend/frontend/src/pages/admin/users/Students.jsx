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
import StudentTable from '@/components/admin/students/StudentTable';
import StudentFilter from '@/components/admin/students/StudentFilter';
import StudentForm from '@/components/admin/students/StudentForm';
import ViewStudentDialog from '@/components/admin/students/ViewStudentDialog';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [initialPassword, setInitialPassword] = useState('');

    const [searchParams, setSearchParams] = useState({
        query: '',
        department_id: '',
        current_session_id: '',
        type: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [studentsRes, departmentsRes, sessionsRes] = await Promise.all([
                api.get('/admin/student'),
                api.get('/admin/department'),
                api.get('/admin/session')
            ]);

            setStudents(studentsRes.data.students);
            setDepartments(departmentsRes.data.departments);
            setSessions(sessionsRes.data.sessions);
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

            let url = '/admin/student';
            const params = new URLSearchParams();

            // Add filters if they exist
            if (searchParams.department_id) params.append('department_id', searchParams.department_id);
            if (searchParams.current_session_id) params.append('current_session_id', searchParams.current_session_id);
            if (searchParams.type) params.append('type', searchParams.type);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);

            // Filter by search query client-side
            let filteredStudents = response.data.students;
            if (searchParams.query.trim()) {
                const query = searchParams.query.toLowerCase();
                filteredStudents = filteredStudents.filter(student =>
                    student.name.toLowerCase().includes(query) ||
                    student.email.toLowerCase().includes(query) ||
                    student.registration_number.includes(query) ||
                    student.roll_number.includes(query)
                );
            }

            setStudents(filteredStudents);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search students');
            console.error('Error searching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedStudent(null);
        setEditMode(false);
        setInitialPassword('');
        setIsFormOpen(true);
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setEditMode(true);
        setIsFormOpen(true);
    };

    const handleView = (student) => {
        setSelectedStudent(student);
        setIsViewDialogOpen(true);
    };

    const handleDelete = (student) => {
        setSelectedStudent(student);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/admin/student/${selectedStudent._id}`);
            fetchData();
            setIsDeleteDialogOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete student');
            console.error('Error deleting student:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveStudent = async (studentData) => {
        try {
            setLoading(true);
            if (editMode) {
                await api.put(`/admin/student/${selectedStudent._id}`, studentData);
                fetchData();
                setIsFormOpen(false);
            } else {
                const response = await api.post('/admin/student', studentData);
                if (response.data.initialPassword) {
                    setInitialPassword(response.data.initialPassword);
                }
                fetchData();
                if (!response.data.initialPassword) {
                    setIsFormOpen(false);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} student`);
            console.error(`Error ${editMode ? 'updating' : 'creating'} student:`, err);
            return false;
        } finally {
            setLoading(false);
        }
        return true;
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Student Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        sx={{ bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                    >
                        Add Student
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <StudentFilter
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                    departments={departments}
                    sessions={sessions}
                    onSearch={handleSearch}
                />

                {loading && !students.length ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress sx={{ color: '#025c53' }} />
                    </Box>
                ) : (
                    <StudentTable
                        students={students}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        loading={loading}
                    />
                )}
            </Box>

            <StudentForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={saveStudent}
                student={selectedStudent}
                departments={departments}
                sessions={sessions}
                editMode={editMode}
                initialPassword={initialPassword}
                onPasswordClose={() => {
                    setInitialPassword('');
                    setIsFormOpen(false);
                }}
            />

            <ViewStudentDialog
                open={isViewDialogOpen}
                onClose={() => setIsViewDialogOpen(false)}
                student={selectedStudent}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                maxWidth="sm"
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete student "{selectedStudent?.name}"? This action cannot be undone.
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