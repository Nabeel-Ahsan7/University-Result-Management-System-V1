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
import ExternalTeacherTable from '@/components/admin/externalTeachers/ExternalTeacherTable';
import ExternalTeacherFilter from '@/components/admin/externalTeachers/ExternalTeacherFilter';
import ExternalTeacherForm from '@/components/admin/externalTeachers/ExternalTeacherForm';
import ViewExternalTeacherDialog from '@/components/admin/externalTeachers/ViewExternalTeacherDialog';

export default function ExternalTeacherManagement() {
    const [externalTeachers, setExternalTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [searchParams, setSearchParams] = useState({
        query: '',
        university: '',
        designation: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/admin/external-teacher');
            setExternalTeachers(response.data.externalTeachers);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        try {
            setLoading(true);
            setError(null);

            // Filter by search query client-side since API doesn't support direct filtering
            let filteredTeachers = externalTeachers;

            if (searchParams.query.trim()) {
                const query = searchParams.query.toLowerCase();
                filteredTeachers = filteredTeachers.filter(teacher =>
                    teacher.name.toLowerCase().includes(query) ||
                    teacher.email.toLowerCase().includes(query) ||
                    teacher.department.toLowerCase().includes(query) ||
                    teacher.phone.includes(query)
                );
            }

            if (searchParams.university) {
                filteredTeachers = filteredTeachers.filter(teacher =>
                    teacher.university_name.toLowerCase().includes(searchParams.university.toLowerCase())
                );
            }

            if (searchParams.designation) {
                filteredTeachers = filteredTeachers.filter(teacher =>
                    teacher.designation.toLowerCase().includes(searchParams.designation.toLowerCase())
                );
            }

            setExternalTeachers(filteredTeachers);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search external teachers');
            console.error('Error searching external teachers:', err);
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
            await api.delete(`/admin/external-teacher/${selectedTeacher._id}`);
            fetchData();
            setIsDeleteDialogOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete external teacher');
            console.error('Error deleting external teacher:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveExternalTeacher = async (teacherData) => {
        try {
            setLoading(true);
            if (editMode) {
                await api.put(`/admin/external-teacher/${selectedTeacher._id}`, teacherData);
            } else {
                await api.post('/admin/external-teacher', teacherData);
            }
            fetchData();
            setIsFormOpen(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} external teacher`);
            console.error(`Error ${editMode ? 'updating' : 'creating'} external teacher:`, err);
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
                        External Teacher Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        sx={{ bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                    >
                        Add External Teacher
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <ExternalTeacherFilter
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                    onSearch={handleSearch}
                    onReset={fetchData}
                />

                {loading && !externalTeachers.length ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress sx={{ color: '#025c53' }} />
                    </Box>
                ) : (
                    <ExternalTeacherTable
                        externalTeachers={externalTeachers}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        loading={loading}
                    />
                )}
            </Box>

            <ExternalTeacherForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={saveExternalTeacher}
                teacher={selectedTeacher}
                editMode={editMode}
            />

            <ViewExternalTeacherDialog
                open={isViewDialogOpen}
                onClose={() => setIsViewDialogOpen(false)}
                teacher={selectedTeacher}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete external teacher "{selectedTeacher?.name}"? This action cannot be undone.
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