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
import ExamCommitteeTable from '@/components/admin/examCommittees/ExamCommitteeTable';
import ExamCommitteeFilter from '@/components/admin/examCommittees/ExamCommitteeFilter';
import ExamCommitteeForm from '@/components/admin/examCommittees/ExamCommitteeForm';
import ViewExamCommitteeDialog from '@/components/admin/examCommittees/ViewExamCommitteeDialog';

export default function ExamCommitteeManagement() {
    const [examCommittees, setExamCommittees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [externalTeachers, setExternalTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCommittee, setSelectedCommittee] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [searchParams, setSearchParams] = useState({
        session_id: '',
        department_id: '',
        is_active: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [
                committeesRes,
                departmentsRes,
                sessionsRes,
                semestersRes,
                teachersRes,
                externalTeachersRes
            ] = await Promise.all([
                api.get('/admin/exam-committee'),
                api.get('/admin/department'),
                api.get('/admin/session'),
                api.get('/admin/semester'),
                api.get('/admin/teacher'),
                api.get('/admin/external-teacher')
            ]);

            setExamCommittees(committeesRes.data.examCommittees);
            setDepartments(departmentsRes.data.departments);
            setSessions(sessionsRes.data.sessions);
            setSemesters(semestersRes.data.semesters);
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

            let url = '/admin/exam-committee';
            const params = new URLSearchParams();

            if (searchParams.session_id) params.append('session_id', searchParams.session_id);
            if (searchParams.department_id) params.append('department_id', searchParams.department_id);
            if (searchParams.is_active) params.append('is_active', searchParams.is_active);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await api.get(url);
            setExamCommittees(response.data.examCommittees);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to search committees');
            console.error('Error searching committees:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedCommittee(null);
        setEditMode(false);
        setIsFormOpen(true);
    };

    const handleEdit = (committee) => {
        setSelectedCommittee(committee);
        setEditMode(true);
        setIsFormOpen(true);
    };

    const handleView = (committee) => {
        setSelectedCommittee(committee);
        setIsViewDialogOpen(true);
    };

    const handleDelete = (committee) => {
        setSelectedCommittee(committee);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            setLoading(true);
            await api.delete(`/admin/exam-committee/${selectedCommittee._id}`);
            fetchData();
            setIsDeleteDialogOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete committee');
            console.error('Error deleting committee:', err);
        } finally {
            setLoading(false);
        }
    };

    const saveCommittee = async (committeeData) => {
        try {
            setLoading(true);
            if (editMode) {
                await api.put(`/admin/exam-committee/${selectedCommittee._id}`, committeeData);
            } else {
                await api.post('/admin/exam-committee', committeeData);
            }
            fetchData();
            setIsFormOpen(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${editMode ? 'update' : 'create'} committee`);
            console.error(`Error ${editMode ? 'updating' : 'creating'} committee:`, err);
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
                        Exam Committee Management
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        sx={{ bgcolor: '#025c53', '&:hover': { bgcolor: '#01413a' } }}
                    >
                        Add Exam Committee
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <ExamCommitteeFilter
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                    departments={departments}
                    sessions={sessions}
                    onSearch={handleSearch}
                    onReset={fetchData}
                />

                {loading && !examCommittees.length ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                        <CircularProgress sx={{ color: '#025c53' }} />
                    </Box>
                ) : (
                    <ExamCommitteeTable
                        examCommittees={examCommittees}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        loading={loading}
                    />
                )}
            </Box>

            <ExamCommitteeForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={saveCommittee}
                committee={selectedCommittee}
                departments={departments}
                sessions={sessions}
                semesters={semesters}
                teachers={teachers}
                externalTeachers={externalTeachers}
                editMode={editMode}
            />

            <ViewExamCommitteeDialog
                open={isViewDialogOpen}
                onClose={() => setIsViewDialogOpen(false)}
                committee={selectedCommittee}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete exam committee "{selectedCommittee?.name}"? This action cannot be undone.
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