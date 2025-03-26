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
import TeacherTable from '@/components/admin/teachers/TeacherTable';
import TeacherFilter from '@/components/admin/teachers/TeacherFilter';
import TeacherForm from '@/components/admin/teachers/TeacherForm';
import ViewTeacherDialog from '@/components/admin/teachers/ViewTeacherDialog';

export default function TeacherManagement() {
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [searchParams, setSearchParams] = useState({
        query: '',
        department_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [teachersRes, departmentsRes] = await Promise.all([
                api.get('/admin/teacher'),
                api.get('/admin/department')
            ]);

            setTeachers(teachersRes.data.teachers);
            setDepartments(departmentsRes.data.departments);
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

            let url = '/admin/teacher';
            const params = new URLSearchParams();

            if (searchParams.department_id) {
                params.append('department_id', searchParams.department_id);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);

            // Filter by search query client-side (since the API doesn't support query search)
            let filteredTeachers = response.data.teachers;
            if (searchParams.query.trim()) {
                const query = searchParams.query.toLowerCase();
                filteredTeachers = filteredTeachers.filter(teacher =>
                    teacher.name.toLowerCase().includes(query) ||
                    teacher.email.toLowerCase().includes(query) ||
                    teacher.phone_number.includes(query) ||
                    teacher.designation.toLowerCase().includes(query)
                );
            }

            setTeachers(filteredTeachers);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search teachers');
            console.error('Error searching teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedTeacher(null);
        setEditMode(false);
        setIsFormOpen(true);
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setEditMode(true);
        setIsFormOpen(true);
    };

    const handleView = (teacher) => {
        setSelectedTeacher(teacher);
        setIsViewDialogOpen(true);
    };

    const handleDelete = (teacher) => {
        setSelectedTeacher(teacher);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/admin/teacher/${selectedTeacher._id}`);
            fetchData();
            setIsDeleteDialogOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete teacher');
            console.error('Error deleting teacher:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveTeacher = async (teacherData) => {
        try {
            setLoading(true);
            if (editMode) {
                await api.put(`/admin/teacher/${selectedTeacher._id}`, teacherData);
            } else {
                await api.post('/admin/teacher', teacherData);
            }
            fetchData();
            setIsFormOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} teacher`);
            console.error(`Error ${editMode ? 'updating' : 'creating'} teacher:`, err);
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
                        Teacher Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        sx={{ bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                    >
                        Add Teacher
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <TeacherFilter
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                    departments={departments}
                    onSearch={handleSearch}
                />

                {loading && !teachers.length ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress sx={{ color: '#025c53' }} />
                    </Box>
                ) : (
                    <TeacherTable
                        teachers={teachers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        loading={loading}
                    />
                )}
            </Box>

            <TeacherForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={saveTeacher}
                teacher={selectedTeacher}
                departments={departments}
                editMode={editMode}
            />

            <ViewTeacherDialog
                open={isViewDialogOpen}
                onClose={() => setIsViewDialogOpen(false)}
                teacher={selectedTeacher}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete teacher "{selectedTeacher?.name}"? This action cannot be undone.
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