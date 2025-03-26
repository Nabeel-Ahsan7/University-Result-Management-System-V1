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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/Select.jsx";
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';

const API_URL = 'http://localhost:4000/v1/api/admin';

export default function DepartmentManagement() {
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [facultyFilter, setFacultyFilter] = useState('');

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentDepartment, setCurrentDepartment] = useState(null);
    const [formData, setFormData] = useState({ name: '', faculty_id: '' });
    const [submitting, setSubmitting] = useState(false);

    // Fetch departments and faculties on component mount
    useEffect(() => {
        Promise.all([
            fetchDepartments(),
            fetchFaculties()
        ]);
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/department`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDepartments(response.data.departments);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching departments:', err);
            setError('Failed to load departments');
            setLoading(false);
        }
    };

    const fetchFaculties = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/faculty`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFaculties(response.data.faculties);
        } catch (err) {
            console.error('Error fetching faculties:', err);
            setError('Failed to load faculties');
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value, name) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleAddDepartment = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            const response = await axios.post(
                `${API_URL}/department`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setDepartments([...departments, response.data.department]);
            setIsAddDialogOpen(false);
            setFormData({ name: '', faculty_id: '' });
            setSubmitting(false);
        } catch (err) {
            console.error('Error adding department:', err);
            alert(err.response?.data?.message || 'Failed to add department');
            setSubmitting(false);
        }
    };

    const handleEditDepartment = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            const response = await axios.put(
                `${API_URL}/department/${currentDepartment._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setDepartments(departments.map(department =>
                department._id === currentDepartment._id ? response.data.department : department
            ));

            setIsEditDialogOpen(false);
            setCurrentDepartment(null);
            setFormData({ name: '', faculty_id: '' });
            setSubmitting(false);
        } catch (err) {
            console.error('Error updating department:', err);
            alert(err.response?.data?.message || 'Failed to update department');
            setSubmitting(false);
        }
    };

    const handleDeleteDepartment = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            await axios.delete(`${API_URL}/department/${currentDepartment._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDepartments(departments.filter(department => department._id !== currentDepartment._id));
            setIsDeleteDialogOpen(false);
            setCurrentDepartment(null);
            setSubmitting(false);
        } catch (err) {
            console.error('Error deleting department:', err);
            alert(err.response?.data?.message || 'Failed to delete department');
            setSubmitting(false);
        }
    };

    const openEditDialog = (department) => {
        setCurrentDepartment(department);
        setFormData({
            name: department.name,
            faculty_id: department.faculty_id._id
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (department) => {
        setCurrentDepartment(department);
        setIsDeleteDialogOpen(true);
    };

    // Filter departments based on search query and faculty filter
    const filteredDepartments = departments.filter(department => {
        const nameMatch = department.name.toLowerCase().includes(searchQuery.toLowerCase());
        const facultyMatch = !facultyFilter || department.faculty_id._id === facultyFilter;
        return nameMatch && facultyMatch;
    });

    if (loading) return <div className="text-center py-12">Loading departments...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Department Management</h1>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search departments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-60 border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                        />
                    </div>
                    <Select
                        value={facultyFilter}
                        onValueChange={setFacultyFilter}
                    >
                        <SelectTrigger
                            className="w-48 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#025c53] focus:border-[#025c53]"
                        >
                            <SelectValue placeholder="Filter by faculty" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
                            <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer py-2 px-3">
                                All Faculties
                            </SelectItem>
                            {faculties.map(faculty => (
                                <SelectItem
                                    key={faculty._id}
                                    value={faculty._id}
                                    className="hover:bg-gray-100 cursor-pointer py-2 px-3 focus:bg-[#ebf7f6] focus:text-[#025c53]"
                                >
                                    {faculty.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={() => {
                            setFormData({ name: '', faculty_id: '' });
                            setIsAddDialogOpen(true);
                        }}
                        style={{ backgroundColor: "#025c53" }}
                        className="hover:bg-[#01413a] transition-colors text-white font-medium"
                    >
                        <Plus size={16} className="mr-2" /> Add Department
                    </Button>
                </div>
            </div>

            {/* Department List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Faculty
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredDepartments.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                    {searchQuery || facultyFilter ? 'No departments match your search criteria' : 'No departments found'}
                                </td>
                            </tr>
                        ) : (
                            filteredDepartments.map((department) => (
                                <tr key={department._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{department.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{department.faculty_id.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mr-2"
                                            onClick={() => openEditDialog(department)}
                                        >
                                            <Pencil size={14} className="mr-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                            onClick={() => openDeleteDialog(department)}
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

            {/* Add Department Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Add New Department</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Enter the details for the new department.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-medium">Department Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter department name"
                                className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="faculty_id" className="text-gray-700 font-medium">Faculty</Label>
                            <Select
                                value={formData.faculty_id}
                                onValueChange={(value) => handleSelectChange(value, 'faculty_id')}
                            >
                                <SelectTrigger
                                    id="faculty_id"
                                    className="w-full bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#025c53] focus:border-[#025c53]"
                                >
                                    <SelectValue placeholder="Select a faculty" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
                                    {faculties.map(faculty => (
                                        <SelectItem
                                            key={faculty._id}
                                            value={faculty._id}
                                            className="hover:bg-gray-100 cursor-pointer py-2 px-3 focus:bg-[#ebf7f6] focus:text-[#025c53]"
                                        >
                                            {faculty.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            onClick={handleAddDepartment}
                            disabled={submitting || !formData.name.trim() || !formData.faculty_id}
                            style={{ backgroundColor: "#025c53" }}
                            className="hover:bg-[#01413a] transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Add Department
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Department Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Edit Department</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Update the department details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-gray-700 font-medium">Department Name</Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter department name"
                                className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-faculty" className="text-gray-700 font-medium">Faculty</Label>
                            <Select
                                value={formData.faculty_id}
                                onValueChange={(value) => handleSelectChange(value, 'faculty_id')}
                            >
                                <SelectTrigger
                                    id="edit-faculty"
                                    className="w-full bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#025c53] focus:border-[#025c53]"
                                >
                                    <SelectValue placeholder="Select a faculty" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
                                    {faculties.map(faculty => (
                                        <SelectItem
                                            key={faculty._id}
                                            value={faculty._id}
                                            className="hover:bg-gray-100 cursor-pointer py-2 px-3 focus:bg-[#ebf7f6] focus:text-[#025c53]"
                                        >
                                            {faculty.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            onClick={handleEditDepartment}
                            disabled={submitting || !formData.name.trim() || !formData.faculty_id}
                            style={{ backgroundColor: "#025c53" }}
                            className="hover:bg-[#01413a] transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Update Department
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Department Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Delete Department</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Are you sure you want to delete this department? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-5">
                        <p className="text-sm text-gray-700">
                            Department: <span className="font-medium text-[#025c53]">{currentDepartment?.name}</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            Faculty: <span className="font-medium text-[#025c53]">{currentDepartment?.faculty_id.name}</span>
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
                            onClick={handleDeleteDepartment}
                            disabled={submitting}
                            style={{ backgroundColor: "#dc2626" }}
                            className="hover:bg-red-700 transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Delete Department
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}