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
import { Plus, Pencil, Trash2, Loader2, Search, Filter } from 'lucide-react';

const API_URL = 'http://localhost:4000/v1/api/admin';

export default function CourseManagement() {
    // Main data states
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        department_id: 'all',  // Changed from empty string to 'all'
        credit: 'all'          // Changed from empty string to 'all'
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [formData, setFormData] = useState({
        course_code: '',
        course_name: '',  // Changed from title to course_name
        credit: ''       // Changed from credits to credit
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch data on component mount
    useEffect(() => {
        Promise.all([
            fetchCourses(),
            fetchDepartments()
            // Removed fetchSemesters
        ]);
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/course`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses(response.data.courses);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses');
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/department`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDepartments(response.data.departments);
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    // Input handlers
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (value, name) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFilterChange = (value, name) => {
        setFilters({ ...filters, [name]: value });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const resetFilters = () => {
        setFilters({
            department_id: 'all',  // Changed from empty string to 'all'
            credit: 'all'          // Changed from empty string to 'all'
        });
    };

    // Filter courses based on search term and filters
    const filteredCourses = courses.filter(course => {
        // Search term filtering
        const matchesSearch = searchTerm === '' ||
            course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.course_name.toLowerCase().includes(searchTerm.toLowerCase());  // Changed from title to course_name

        // Department filtering
        const matchesDepartment = filters.department_id === 'all' ||  // Changed from empty string to 'all'
            course.department_id._id === filters.department_id;

        // Credits filtering
        const matchesCredit = filters.credit === 'all' ||  // Changed from empty string to 'all'
            course.credit.toString() === filters.credit;  // Changed from credits to credit

        return matchesSearch && matchesDepartment && matchesCredit;
    });

    const handleAddCourse = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            const response = await axios.post(
                `${API_URL}/course`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setCourses([...courses, response.data.course]);
            setIsAddDialogOpen(false);
            setFormData({
                course_code: '',
                course_name: '',  // Changed from title to course_name
                credit: '',      // Changed from credits to credit
                department_id: ''
            });
            setSubmitting(false);
        } catch (err) {
            console.error('Error adding course:', err);
            alert(err.response?.data?.message || 'Failed to add course');
            setSubmitting(false);
        }
    };

    const handleEditCourse = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            const response = await axios.put(
                `${API_URL}/course/${currentCourse._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setCourses(courses.map(course =>
                course._id === currentCourse._id ? response.data.course : course
            ));

            setIsEditDialogOpen(false);
            setCurrentCourse(null);
            setFormData({
                course_code: '',
                course_name: '',  // Changed from title to course_name
                credit: '',      // Changed from credits to credit
                department_id: ''
            });
            setSubmitting(false);
        } catch (err) {
            console.error('Error updating course:', err);
            alert(err.response?.data?.message || 'Failed to update course');
            setSubmitting(false);
        }
    };

    const handleDeleteCourse = async () => {
        try {
            setSubmitting(true);
            const token = localStorage.getItem('adminToken');

            await axios.delete(`${API_URL}/course/${currentCourse._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCourses(courses.filter(course => course._id !== currentCourse._id));
            setIsDeleteDialogOpen(false);
            setCurrentCourse(null);
            setSubmitting(false);
        } catch (err) {
            console.error('Error deleting course:', err);
            alert(err.response?.data?.message || 'Failed to delete course');
            setSubmitting(false);
        }
    };

    const openEditDialog = (course) => {
        setCurrentCourse(course);
        setFormData({
            course_code: course.course_code,
            course_name: course.course_name,  // Changed from title to course_name
            credit: course.credit,           // Changed from credits to credit
            department_id: course.department_id._id
        });
        setIsEditDialogOpen(true);
    };

    const openDeleteDialog = (course) => {
        setCurrentCourse(course);
        setIsDeleteDialogOpen(true);
    };

    // Add this function to get unique credit values
    const getUniqueCredits = () => {
        const credits = courses.map(course => course.credit);
        // Get unique values and sort them
        return [...new Set(credits)].sort((a, b) => a - b);
    };

    if (loading) return <div className="text-center py-12">Loading courses...</div>;
    if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Course Management</h1>
                <Button
                    onClick={() => {
                        setFormData({
                            course_code: '',
                            course_name: '',  // Changed from title to course_name
                            credit: '',      // Changed from credits to credit
                            department_id: ''
                        });
                        setIsAddDialogOpen(true);
                    }}
                    style={{ backgroundColor: "#025c53" }}
                    className="hover:bg-[#01413a] transition-colors text-white font-medium"
                >
                    <Plus size={16} className="mr-2" /> Add Course
                </Button>
            </div>

            {/* Search and Filter UI */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Input
                            type="text"
                            placeholder="Search by course code or title"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-10 border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="md:w-auto w-full justify-center border-gray-300 text-gray-700"
                    >
                        <Filter size={16} className="mr-2" /> Filter Options
                    </Button>
                </div>

                {isFilterOpen && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                            <Label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Department
                            </Label>
                            <Select
                                value={filters.department_id}
                                onValueChange={(value) => handleFilterChange(value, 'department_id')}
                            >
                                <SelectTrigger
                                    id="department-filter"
                                    className="w-full bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#025c53] focus:border-[#025c53]"
                                >
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
                                    <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer py-2 px-3">
                                        All Departments
                                    </SelectItem>
                                    {departments.map(department => (
                                        <SelectItem
                                            key={department._id}
                                            value={department._id}
                                            className="hover:bg-gray-100 cursor-pointer py-2 px-3"
                                        >
                                            {department.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="credit-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Credits
                            </Label>
                            <Select
                                value={filters.credit}
                                onValueChange={(value) => handleFilterChange(value, 'credit')}
                            >
                                <SelectTrigger
                                    id="credit-filter"
                                    className="w-full bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#025c53] focus:border-[#025c53]"
                                >
                                    <SelectValue placeholder="All Credits" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
                                    <SelectItem value="all" className="hover:bg-gray-100 cursor-pointer py-2 px-3">
                                        All Credits
                                    </SelectItem>
                                    {getUniqueCredits().map(credit => (
                                        <SelectItem
                                            key={credit}
                                            value={credit.toString()}
                                            className="hover:bg-gray-100 cursor-pointer py-2 px-3"
                                        >
                                            {credit} {credit === 1 ? 'Credit' : 'Credits'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Reset Filters
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Course List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Course Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Credits
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCourses.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No courses found
                                </td>
                            </tr>
                        ) : (
                            filteredCourses.map((course) => (
                                <tr key={course._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{course.course_code}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{course.course_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{course.credit}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{course.department_id.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mr-2"
                                            onClick={() => openEditDialog(course)}
                                        >
                                            <Pencil size={14} className="mr-1" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 border-red-600 hover:bg-red-50"
                                            onClick={() => openDeleteDialog(course)}
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

            {/* Add Course Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg max-w-3xl">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Add New Course</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Enter the details for the new course.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="course_code" className="text-gray-700 font-medium">Course Code</Label>
                                <Input
                                    id="course_code"
                                    name="course_code"
                                    value={formData.course_code}
                                    onChange={handleInputChange}
                                    placeholder="Enter course code (e.g., CSE-101)"
                                    className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="course_name" className="text-gray-700 font-medium">Course Title</Label>
                                <Input
                                    id="course_name"
                                    name="course_name"
                                    value={formData.course_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter course title"
                                    className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="credit" className="text-gray-700 font-medium">Credits</Label>
                                <Input
                                    id="credit"
                                    name="credit"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={formData.credit}
                                    onChange={handleInputChange}
                                    placeholder="Enter credits"
                                    className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department_id" className="text-gray-700 font-medium">Department</Label>
                                <Select
                                    value={formData.department_id}
                                    onValueChange={(value) => handleSelectChange(value, 'department_id')}
                                >
                                    <SelectTrigger
                                        id="department_id"
                                        className="w-full bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#025c53] focus:border-[#025c53]"
                                    >
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
                                        {departments.map(department => (
                                            <SelectItem
                                                key={department._id}
                                                value={department._id}
                                                className="hover:bg-gray-100 cursor-pointer py-2 px-3"
                                            >
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                            onClick={handleAddCourse}
                            disabled={submitting || !formData.course_code.trim() || !formData.course_name.trim() || !formData.credit || !formData.department_id}
                            style={{ backgroundColor: "#025c53" }}
                            className="hover:bg-[#01413a] transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Add Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Course Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg max-w-3xl">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Edit Course</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Update the course details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-course_code" className="text-gray-700 font-medium">Course Code</Label>
                                <Input
                                    id="edit-course_code"
                                    name="course_code"
                                    value={formData.course_code}
                                    onChange={handleInputChange}
                                    placeholder="Enter course code"
                                    className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-course_name" className="text-gray-700 font-medium">Course Title</Label>
                                <Input
                                    id="edit-course_name"
                                    name="course_name"
                                    value={formData.course_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter course title"
                                    className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-credit" className="text-gray-700 font-medium">Credits</Label>
                                <Input
                                    id="edit-credit"
                                    name="credit"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={formData.credit}
                                    onChange={handleInputChange}
                                    placeholder="Enter credits"
                                    className="border-gray-300 focus:border-[#025c53] focus:ring-[#025c53]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-department_id" className="text-gray-700 font-medium">Department</Label>
                                <Select
                                    value={formData.department_id}
                                    onValueChange={(value) => handleSelectChange(value, 'department_id')}
                                >
                                    <SelectTrigger
                                        id="edit-department_id"
                                        className="w-full bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#025c53] focus:border-[#025c53]"
                                    >
                                        <SelectValue placeholder="Select a department" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md overflow-hidden">
                                        {departments.map(department => (
                                            <SelectItem
                                                key={department._id}
                                                value={department._id}
                                                className="hover:bg-gray-100 cursor-pointer py-2 px-3"
                                            >
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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
                            onClick={handleEditCourse}
                            disabled={submitting || !formData.course_code.trim() || !formData.course_name.trim() || !formData.credit || !formData.department_id}
                            style={{ backgroundColor: "#025c53" }}
                            className="hover:bg-[#01413a] transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Update Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Course Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="bg-white border-0 shadow-lg rounded-lg">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold text-gray-800">Delete Course</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Are you sure you want to delete this course? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-5">
                        <p className="text-sm text-gray-700">
                            Course Code: <span className="font-medium text-[#025c53]">{currentCourse?.course_code}</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            Title: <span className="font-medium text-[#025c53]">{currentCourse?.course_name}</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            Department: <span className="font-medium text-[#025c53]">{currentCourse?.department_id.name}</span>
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
                            onClick={handleDeleteCourse}
                            disabled={submitting}
                            style={{ backgroundColor: "#dc2626" }}
                            className="hover:bg-red-700 transition-colors text-white font-medium"
                        >
                            {submitting ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                            Delete Course
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}