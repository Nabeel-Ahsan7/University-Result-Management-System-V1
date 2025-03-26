import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "../../../components/ui/Button.jsx";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/Dialog.jsx";
import { Input } from "../../../components/ui/Input.jsx";
import { Label } from "../../../components/ui/Label.jsx";
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';

const API_URL = 'http://localhost:4000/v1/api/admin';

export default function SemesterManagement() {
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentSemester, setCurrentSemester] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [submitting, setSubmitting] = useState(false);

    // Fetch semesters on component mount
    useEffect(() => {
        fetchSemesters();
    }, []);

    const fetchSemesters = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/semester`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSemesters(response.data.semesters);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching semesters:', err);
            setError('Failed to load semesters');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSemester = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            const response = await axios.post(
                `${API_URL}/semester`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSemesters([...semesters, response.data.semester]);
            setIsAddDialogOpen(false);
            setFormData({ name: '' });
            setSubmitting(false);
        } catch (err) {
            console.error('Error adding semester:', err);
            alert(err.response?.data?.message || 'Failed to add semester');
            setSubmitting(false);
        }
    };

    const handleEditSemester = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            const response = await axios.put(
                `${API_URL}/semester/${currentSemester._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setSemesters(semesters.map(semester =>
                semester._id === currentSemester._id ? response.data.semester : semester
            ));

            setIsEditDialogOpen(false);
            setCurrentSemester(null);
            setFormData({ name: '' });
            setSubmitting(false);
        } catch (err) {
            console.error('Error updating semester:', err);
            alert(err.response?.data?.message || 'Failed to update semester');
            setSubmitting(false);
        }
    };

    const handleDeleteSemester = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            await axios.delete(`${API_URL}/semester/${currentSemester._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSemesters(semesters.filter(semester => semester._id !== currentSemester._id));
            setIsDeleteDialogOpen(false);
            setCurrentSemester(null);
            setSubmitting(false);
        } catch (err) {
            console.error('Error deleting semester:', err);
            alert(err.response?.data?.message || 'Failed to delete semester');
            setSubmitting(false);
        }
    };

    const openEditDialog = (semester) => {
        setCurrentSemester(semester);
        setFormData({ name: semester.name });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (semester) => {
        setCurrentSemester(semester);
        setIsDeleteDialogOpen(true);
    };

    // Filter semesters based on search query
    const filteredSemesters = semesters.filter(semester =>
        semester.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-center py-12">Loading semesters...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Semester Management</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search semesters..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-60 border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                        />
                    </div>
                    <Button
                        onClick={() => {
                            setFormData({ name: '' });
                            setIsAddDialogOpen(true);
                        }}
                        style={{ backgroundColor: "#025c53" }}
                        className="hover:bg-[#01413a] transition-colors text-white font-medium"
                    >
                        <Plus size={16} className="mr-2" /> Add Semester
                    </Button>
                </div>
            </div>

            {/* Semester List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSemesters.length === 0 ? (
                            <tr>
                                <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                                    {searchQuery ? 'No semesters match your search' : 'No semesters found'}
                                </td>
                            </tr>
                        ) : (
                            filteredSemesters.map((semester) => (
                                <tr key={semester._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{semester.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mr-2"
                                            onClick={() => openEditDialog(semester)}
                                        >
                                            <Pencil size={14} className="mr-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                            onClick={() => openDeleteDialog(semester)}
                                        >
                                            <Trash2 size={14} className="mr-1" /> Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Semester Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Add New Semester</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Enter the details for the new semester.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-medium">Semester Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter semester name (e.g., 1st Semester)"
                                className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                            />
                        </div>
                    </div>
                    <DialogFooter className="border-t pt-3 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsAddDialogOpen(false)}
                            disabled={submitting}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddSemester}
                            disabled={submitting || !formData.name.trim()}
                            style={{ backgroundColor: "#025c53" }}
                            className="hover:bg-[#01413a] transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Add Semester
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Semester Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Edit Semester</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Update the semester details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-gray-700 font-medium">Semester Name</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter semester name"
                                className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                            />
                        </div>
                    </div>
                    <DialogFooter className="border-t pt-3 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            disabled={submitting}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSemester}
                            disabled={submitting || !formData.name.trim()}
                            style={{ backgroundColor: "#025c53" }}
                            className="hover:bg-[#01413a] transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Update Semester
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Semester Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Delete Semester</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Are you sure you want to delete this semester? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-5">
                        <p className="text-sm text-gray-700">
                            Semester: <span className="font-medium text-[#025c53]">{currentSemester?.name}</span>
                        </p>
                    </div>
                    <DialogFooter className="border-t pt-3 mt-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={submitting}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteSemester}
                            disabled={submitting}
                            style={{ backgroundColor: "#dc2626" }}
                            className="hover:bg-red-700 transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Delete Semester
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}