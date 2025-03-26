const Admin = require('../models/admin.model');
const Faculty = require('../models/faculty.model');
const bcrypt = require('bcrypt');
const Department = require('../models/department.model');
const Course = require('../models/course.model');
const Session = require('../models/session.model');
const Semester = require('../models/semester.model');
const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');
const ExternalTeacher = require('../models/externalTeacher.model');
const ExamCommittee = require('../models/examCommittee.model.js');
const CourseAssignment = require('../models/courseAssignment.model.js');
const Exam = require('../models/exam.model.js');
const InternalExam = require('../models/internalExam.model.js');
const ExternalExam = require('../models/externalExam.model.js');
const ApprovalStatus = require('../models/approvalStatus.model');

// Register new admin
exports.registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        // Create new admin
        const admin = new Admin({
            name,
            email,
            password
        });

        await admin.save();

        // Generate JWT token
        const token = admin.generateAuthToken();

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Register Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Login admin
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin by email with password included
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check password
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = admin.generateAuthToken();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Login Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');

        res.status(200).json({
            success: true,
            count: admins.length,
            admins
        });
    } catch (error) {
        console.error('Get All Admins Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await Admin.findByIdAndDelete(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Delete Admin Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Faculty Management Functions

// Add new faculty
exports.addFaculty = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Faculty name is required'
            });
        }

        // Check if faculty already exists
        const existingFaculty = await Faculty.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingFaculty) {
            return res.status(400).json({
                success: false,
                message: 'Faculty with this name already exists'
            });
        }

        // Create new faculty
        const faculty = new Faculty({ name });
        await faculty.save();

        res.status(201).json({
            success: true,
            message: 'Faculty added successfully',
            faculty
        });
    } catch (error) {
        console.error('Add Faculty Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all faculties
exports.getAllFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: faculties.length,
            faculties
        });
    } catch (error) {
        console.error('Get All Faculties Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete faculty
exports.deleteFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        const faculty = await Faculty.findByIdAndDelete(id);

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Faculty deleted successfully'
        });
    } catch (error) {
        console.error('Delete Faculty Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update faculty
exports.updateFaculty = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Faculty name is required'
            });
        }

        // Find faculty
        const faculty = await Faculty.findById(id);
        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        // Check for duplicate if name changed
        if (name !== faculty.name) {
            const existingFaculty = await Faculty.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id } // Exclude current faculty
            });

            if (existingFaculty) {
                return res.status(400).json({
                    success: false,
                    message: 'Faculty with this name already exists'
                });
            }
        }

        // Update faculty
        const updatedFaculty = await Faculty.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Faculty updated successfully',
            faculty: updatedFaculty
        });
    } catch (error) {
        console.error('Update Faculty Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single faculty
exports.getFaculty = async (req, res) => {
    try {
        const { id } = req.params;

        const faculty = await Faculty.findById(id);

        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        res.status(200).json({
            success: true,
            faculty
        });
    } catch (error) {
        console.error('Get Faculty Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Department Management Functions

// Add new department
exports.addDepartment = async (req, res) => {
    try {
        const { name, faculty_id } = req.body;

        // Validate input
        if (!name || !faculty_id) {
            return res.status(400).json({
                success: false,
                message: 'Department name and faculty ID are required'
            });
        }

        // Check if faculty exists
        const faculty = await Faculty.findById(faculty_id);
        if (!faculty) {
            return res.status(404).json({
                success: false,
                message: 'Faculty not found'
            });
        }

        // Check if department already exists in this faculty
        const existingDepartment = await Department.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            faculty_id
        });

        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists in the selected faculty'
            });
        }

        // Create new department
        const department = new Department({
            name,
            faculty_id
        });

        await department.save();

        res.status(201).json({
            success: true,
            message: 'Department added successfully',
            department
        });
    } catch (error) {
        console.error('Add Department Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
    console.log("Get all departments");
    try {
        const { faculty_id } = req.query;

        // Query builder
        let query = {};

        // Filter by faculty if provided
        if (faculty_id) {
            query.faculty_id = faculty_id;
        }

        // Get departments with faculty information
        const departments = await Department.find(query)
            .populate('faculty_id', 'name')
            .sort({ name: 1 });
        res.status(200).json({
            success: true,
            count: departments.length,
            departments
        });
    } catch (error) {
        console.error('Get All Departments Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single department
exports.getDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findById(id)
            .populate('faculty_id', 'name');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            department
        });
    } catch (error) {
        console.error('Get Department Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update department
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, faculty_id } = req.body;

        // Find department
        const department = await Department.findById(id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if faculty exists if faculty_id is provided
        if (faculty_id) {
            const faculty = await Faculty.findById(faculty_id);
            if (!faculty) {
                return res.status(404).json({
                    success: false,
                    message: 'Faculty not found'
                });
            }
        }

        // Check for duplicate if name or faculty changed
        if ((name && name !== department.name) ||
            (faculty_id && faculty_id.toString() !== department.faculty_id.toString())) {

            const existingDepartment = await Department.findOne({
                name: name || department.name,
                faculty_id: faculty_id || department.faculty_id,
                _id: { $ne: id } // Exclude current department
            });

            if (existingDepartment) {
                return res.status(400).json({
                    success: false,
                    message: 'Department with this name already exists in the selected faculty'
                });
            }
        }

        // Update department
        const updatedDepartment = await Department.findByIdAndUpdate(
            id,
            { name, faculty_id },
            { new: true, runValidators: true }
        ).populate('faculty_id', 'name');

        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            department: updatedDepartment
        });
    } catch (error) {
        console.error('Update Department Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findByIdAndDelete(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Delete Department Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Course Management Functions

// Add new course
exports.addCourse = async (req, res) => {
    try {
        const { department_id, course_code, course_name, credit } = req.body;

        // Validate input
        if (!department_id || !course_code || !course_name || !credit) {
            return res.status(400).json({
                success: false,
                message: 'Department ID, course code, course name, and credit hours are required'
            });
        }

        // Check if department exists
        const department = await Department.findById(department_id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if course already exists in this department
        const existingCourse = await Course.findOne({
            course_code: course_code.toUpperCase(),
            department_id
        });

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'Course with this code already exists in the selected department'
            });
        }

        // Create new course
        const course = new Course({
            department_id,
            course_code: course_code.toUpperCase(),
            course_name,
            credit
        });

        await course.save();

        res.status(201).json({
            success: true,
            message: 'Course added successfully',
            course
        });
    } catch (error) {
        console.error('Add Course Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const { department_id } = req.query;

        // Query builder
        let query = {};

        // Filter by department if provided
        if (department_id) {
            query.department_id = department_id;
        }

        // Get courses with department information
        const courses = await Course.find(query)
            .populate({
                path: 'department_id',
                select: 'name faculty_id',
                populate: {
                    path: 'faculty_id',
                    select: 'name'
                }
            })
            .sort({ course_code: 1 });

        res.status(200).json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        console.error('Get All Courses Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single course
exports.getCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id)
            .populate({
                path: 'department_id',
                select: 'name faculty_id',
                populate: {
                    path: 'faculty_id',
                    select: 'name'
                }
            });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            course
        });
    } catch (error) {
        console.error('Get Course Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update course
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { department_id, course_code, course_name, credit } = req.body;

        // Find course
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if department exists if department_id is provided
        if (department_id) {
            const department = await Department.findById(department_id);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }
        }

        // Check for duplicate if code or department changed
        if ((course_code && course_code !== course.course_code) ||
            (department_id && department_id.toString() !== course.department_id.toString())) {

            const existingCourse = await Course.findOne({
                course_code: course_code ? course_code.toUpperCase() : course.course_code,
                department_id: department_id || course.department_id,
                _id: { $ne: id } // Exclude current course
            });

            if (existingCourse) {
                return res.status(400).json({
                    success: false,
                    message: 'Course with this code already exists in the selected department'
                });
            }
        }

        // Update course
        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            {
                department_id: department_id || course.department_id,
                course_code: course_code ? course_code.toUpperCase() : course.course_code,
                course_name: course_name || course.course_name,
                credit: credit || course.credit
            },
            { new: true, runValidators: true }
        ).populate({
            path: 'department_id',
            select: 'name faculty_id',
            populate: {
                path: 'faculty_id',
                select: 'name'
            }
        });

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course: updatedCourse
        });
    } catch (error) {
        console.error('Update Course Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete course
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Delete Course Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
// Add new session
exports.addSession = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Session name is required'
            });
        }

        // Check if session already exists
        const existingSession = await Session.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingSession) {
            return res.status(400).json({
                success: false,
                message: 'Session with this name already exists'
            });
        }

        // Create new session
        const session = new Session({ name });
        await session.save();

        res.status(201).json({
            success: true,
            message: 'Session added successfully',
            session
        });
    } catch (error) {
        console.error('Add Session Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: sessions.length,
            sessions
        });
    } catch (error) {
        console.error('Get All Sessions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single session
exports.getSession = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findById(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.status(200).json({
            success: true,
            session
        });
    } catch (error) {
        console.error('Get Session Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update session
exports.updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Session name is required'
            });
        }

        // Find session
        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Check for duplicate if name changed
        if (name !== session.name) {
            const existingSession = await Session.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id } // Exclude current session
            });

            if (existingSession) {
                return res.status(400).json({
                    success: false,
                    message: 'Session with this name already exists'
                });
            }
        }

        // Update session
        const updatedSession = await Session.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Session updated successfully',
            session: updatedSession
        });
    } catch (error) {
        console.error('Update Session Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete session
exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findByIdAndDelete(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Session deleted successfully'
        });
    } catch (error) {
        console.error('Delete Session Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add new semester
exports.addSemester = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Semester name is required'
            });
        }

        // Check if semester already exists
        const existingSemester = await Semester.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingSemester) {
            return res.status(400).json({
                success: false,
                message: 'Semester with this name already exists'
            });
        }

        // Create new semester
        const semester = new Semester({ name });
        await semester.save();

        res.status(201).json({
            success: true,
            message: 'Semester added successfully',
            semester
        });
    } catch (error) {
        console.error('Add Semester Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all semesters
exports.getAllSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: semesters.length,
            semesters
        });
    } catch (error) {
        console.error('Get All Semesters Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single semester
exports.getSemester = async (req, res) => {
    try {
        const { id } = req.params;

        const semester = await Semester.findById(id);

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: 'Semester not found'
            });
        }

        res.status(200).json({
            success: true,
            semester
        });
    } catch (error) {
        console.error('Get Semester Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update semester
exports.updateSemester = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Semester name is required'
            });
        }

        // Find semester
        const semester = await Semester.findById(id);
        if (!semester) {
            return res.status(404).json({
                success: false,
                message: 'Semester not found'
            });
        }

        // Check for duplicate if name changed
        if (name !== semester.name) {
            const existingSemester = await Semester.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: id } // Exclude current semester
            });

            if (existingSemester) {
                return res.status(400).json({
                    success: false,
                    message: 'Semester with this name already exists'
                });
            }
        }

        // Update semester
        const updatedSemester = await Semester.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Semester updated successfully',
            semester: updatedSemester
        });
    } catch (error) {
        console.error('Update Semester Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete semester
exports.deleteSemester = async (req, res) => {
    try {
        const { id } = req.params;

        const semester = await Semester.findByIdAndDelete(id);

        if (!semester) {
            return res.status(404).json({
                success: false,
                message: 'Semester not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Semester deleted successfully'
        });
    } catch (error) {
        console.error('Delete Semester Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add new teacher
exports.addTeacher = async (req, res) => {
    try {
        const { name, email, password, designation, department_id, phone_number } = req.body;

        // Validate input
        if (!name || !email || !password || !designation || !department_id || !phone_number) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if department exists
        const department = await Department.findById(department_id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if teacher with email already exists
        const existingTeacher = await Teacher.findOne({ email: email.toLowerCase() });
        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: 'Teacher with this email already exists'
            });
        }

        // Create new teacher
        const teacher = new Teacher({
            name,
            email: email.toLowerCase(),
            password,
            designation,
            department_id,
            phone_number
        });

        await teacher.save();

        // Remove password from response
        const teacherResponse = teacher.toObject();
        delete teacherResponse.password;

        res.status(201).json({
            success: true,
            message: 'Teacher added successfully',
            teacher: teacherResponse
        });
    } catch (error) {
        console.error('Add Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const { department_id } = req.query;

        // Query builder
        let query = {};

        // Filter by department if provided
        if (department_id) {
            query.department_id = department_id;
        }

        // Get teachers with department information
        const teachers = await Teacher.find(query)
            .select('-password')
            .populate({
                path: 'department_id',
                select: 'name faculty_id',
                populate: {
                    path: 'faculty_id',
                    select: 'name'
                }
            })
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        });
    } catch (error) {
        console.error('Get All Teachers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single teacher
exports.getTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teacher.findById(id)
            .select('-password')
            .populate({
                path: 'department_id',
                select: 'name faculty_id',
                populate: {
                    path: 'faculty_id',
                    select: 'name'
                }
            });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            teacher
        });
    } catch (error) {
        console.error('Get Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update teacher
exports.updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, designation, department_id, phone_number } = req.body;

        // Find teacher
        const teacher = await Teacher.findById(id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Check if department exists if department_id is provided
        if (department_id) {
            const department = await Department.findById(department_id);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }
        }

        // Check for duplicate email if email changed
        if (email && email.toLowerCase() !== teacher.email) {
            const existingTeacher = await Teacher.findOne({
                email: email.toLowerCase(),
                _id: { $ne: id } // Exclude current teacher
            });

            if (existingTeacher) {
                return res.status(400).json({
                    success: false,
                    message: 'Teacher with this email already exists'
                });
            }
        }

        // Update teacher
        const updatedTeacher = await Teacher.findByIdAndUpdate(
            id,
            {
                name: name || teacher.name,
                email: email ? email.toLowerCase() : teacher.email,
                designation: designation || teacher.designation,
                department_id: department_id || teacher.department_id,
                phone_number: phone_number || teacher.phone_number
            },
            { new: true, runValidators: true }
        )
            .select('-password')
            .populate({
                path: 'department_id',
                select: 'name faculty_id',
                populate: {
                    path: 'faculty_id',
                    select: 'name'
                }
            });

        res.status(200).json({
            success: true,
            message: 'Teacher updated successfully',
            teacher: updatedTeacher
        });
    } catch (error) {
        console.error('Update Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete teacher
exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teacher.findByIdAndDelete(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Teacher deleted successfully'
        });
    } catch (error) {
        console.error('Delete Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


// Add new student
exports.addStudent = async (req, res) => {
    try {
        const {
            name,
            email,
            registration_number,
            roll_number,
            admission_session_id,
            current_session_id,
            department_id,
            type
        } = req.body;

        // Validate input
        if (!name || !email || !registration_number || !roll_number ||
            !admission_session_id || !current_session_id || !department_id || !type) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if department exists
        const department = await Department.findById(department_id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if admission session exists
        const admissionSession = await Session.findById(admission_session_id);
        if (!admissionSession) {
            return res.status(404).json({
                success: false,
                message: 'Admission session not found'
            });
        }

        // Check if current session exists
        const currentSession = await Session.findById(current_session_id);
        if (!currentSession) {
            return res.status(404).json({
                success: false,
                message: 'Current session not found'
            });
        }

        // Check if student with email already exists
        const existingStudentByEmail = await Student.findOne({ email: email.toLowerCase() });
        if (existingStudentByEmail) {
            return res.status(400).json({
                success: false,
                message: 'Student with this email already exists'
            });
        }

        // Check if student with registration_number already exists
        const existingStudentByReg = await Student.findOne({ registration_number });
        if (existingStudentByReg) {
            return res.status(400).json({
                success: false,
                message: 'Student with this registration number already exists'
            });
        }

        // Check if student with roll_number already exists in the same department and session
        const existingStudentByRoll = await Student.findOne({
            roll_number,
            department_id,
            current_session_id
        });

        if (existingStudentByRoll) {
            return res.status(400).json({
                success: false,
                message: 'Student with this roll number already exists in the selected department and session'
            });
        }

        // Generate password based on registration number and name
        const formattedName = name.trim().replace(/\s+/g, '_');  // Replace spaces with underscores
        const password = `${registration_number}_${formattedName}`;

        // Create new student
        const student = new Student({
            name,
            email: email.toLowerCase(),
            password,
            registration_number,
            roll_number,
            admission_session_id,
            current_session_id,
            department_id,
            type
        });

        await student.save();

        // Populate references
        await student.populate([
            { path: 'department_id', select: 'name faculty_id', populate: { path: 'faculty_id', select: 'name' } },
            { path: 'admission_session_id', select: 'name' },
            { path: 'current_session_id', select: 'name' }
        ]);

        // Remove password from response
        const studentResponse = student.toObject();
        delete studentResponse.password;

        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            student: studentResponse,
            initialPassword: password // Include the initial password in the response for admin to share
        });
    } catch (error) {
        console.error('Add Student Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all students with filtering and searching
exports.getAllStudents = async (req, res) => {
    try {
        const { department_id, current_session_id, type, query } = req.query;
        let filter = {};
        // Add filters if they exist
        if (department_id) filter.department_id = department_id;
        if (current_session_id) filter.current_session_id = current_session_id;
        if (type) filter.type = type;

        // Add search query if it exists
        if (query) {
            filter = {
                ...filter,
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } },
                    { registration_number: { $regex: query, $options: 'i' } },
                    { roll_number: { $regex: query, $options: 'i' } }
                ]
            };
        }

        const students = await Student.find(filter)
            .select('-password')
            .populate('department_id', 'name')
            .populate('current_session_id', 'name')
            .populate('admission_session_id', 'name')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        console.error('Get All Students Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single student
exports.getStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id)
            .populate([
                { path: 'department_id', select: 'name faculty_id', populate: { path: 'faculty_id', select: 'name' } },
                { path: 'admission_session_id', select: 'name' },
                { path: 'current_session_id', select: 'name' }
            ]);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        console.error('Get Student Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            email,
            registration_number,
            roll_number,
            admission_session_id,
            current_session_id,
            department_id,
            type
        } = req.body;

        // Find student
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if department exists if department_id is provided
        if (department_id) {
            const department = await Department.findById(department_id);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }
        }

        // Check if admission session exists if admission_session_id is provided
        if (admission_session_id) {
            const admissionSession = await Session.findById(admission_session_id);
            if (!admissionSession) {
                return res.status(404).json({
                    success: false,
                    message: 'Admission session not found'
                });
            }
        }

        // Check if current session exists if current_session_id is provided
        if (current_session_id) {
            const currentSession = await Session.findById(current_session_id);
            if (!currentSession) {
                return res.status(404).json({
                    success: false,
                    message: 'Current session not found'
                });
            }
        }

        // Check for duplicate email if changed
        if (email && email.toLowerCase() !== student.email) {
            const existingStudentByEmail = await Student.findOne({
                email: email.toLowerCase(),
                _id: { $ne: id } // Exclude current student
            });

            if (existingStudentByEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Student with this email already exists'
                });
            }
        }

        // Check for duplicate registration_number if changed
        if (registration_number && registration_number !== student.registration_number) {
            const existingStudentByReg = await Student.findOne({
                registration_number,
                _id: { $ne: id } // Exclude current student
            });

            if (existingStudentByReg) {
                return res.status(400).json({
                    success: false,
                    message: 'Student with this registration number already exists'
                });
            }
        }

        // Check for duplicate roll_number if roll_number, department_id, or current_session_id changed
        if ((roll_number && roll_number !== student.roll_number) ||
            (department_id && department_id.toString() !== student.department_id.toString()) ||
            (current_session_id && current_session_id.toString() !== student.current_session_id.toString())) {

            const existingStudentByRoll = await Student.findOne({
                roll_number: roll_number || student.roll_number,
                department_id: department_id || student.department_id,
                current_session_id: current_session_id || student.current_session_id,
                _id: { $ne: id } // Exclude current student
            });

            if (existingStudentByRoll) {
                return res.status(400).json({
                    success: false,
                    message: 'Student with this roll number already exists in the selected department and session'
                });
            }
        }

        // Update student
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            {
                name: name || student.name,
                email: email ? email.toLowerCase() : student.email,
                registration_number: registration_number || student.registration_number,
                roll_number: roll_number || student.roll_number,
                admission_session_id: admission_session_id || student.admission_session_id,
                current_session_id: current_session_id || student.current_session_id,
                department_id: department_id || student.department_id,
                type: type || student.type
            },
            { new: true, runValidators: true }
        )
            .select('-password')
            .populate([
                { path: 'department_id', select: 'name faculty_id', populate: { path: 'faculty_id', select: 'name' } },
                { path: 'admission_session_id', select: 'name' },
                { path: 'current_session_id', select: 'name' }
            ]);

        res.status(200).json({
            success: true,
            message: 'Student updated successfully',
            student: updatedStudent
        });
    } catch (error) {
        console.error('Update Student Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    } catch (error) {
        console.error('Delete Student Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Search students
exports.searchStudents = async (req, res) => {
    try {
        const { query, department_id, session_id, committee, semester } = req.query;

        // Special case for transcript generator - find students by committee and semester
        if (committee && semester) {
            console.log(`Finding students for committee: ${committee}, semester: ${semester}`);

            // Find course assignments for this committee and semester
            const courseAssignments = await CourseAssignment.find({
                exam_committee_id: committee,
                semester_id: semester
            });

            if (!courseAssignments.length) {
                return res.status(200).json({
                    success: true,
                    students: []
                });
            }

            // Find all exams for these course assignments
            const assignmentIds = courseAssignments.map(ca => ca._id);
            const exams = await Exam.find({
                course_assignment: { $in: assignmentIds }
            }).populate('student');

            // Extract unique students
            const uniqueStudents = [];
            const studentIds = new Set();

            exams.forEach(exam => {
                if (exam.student && !studentIds.has(exam.student._id.toString())) {
                    studentIds.add(exam.student._id.toString());
                    uniqueStudents.push({
                        _id: exam.student._id,
                        name: exam.student.name,
                        roll_number: exam.student.roll_number,
                        registration_number: exam.student.registration_number
                    });
                }
            });

            // Sort students by roll number
            uniqueStudents.sort((a, b) => a.roll_number.localeCompare(b.roll_number));

            return res.status(200).json({
                success: true,
                students: uniqueStudents
            });
        }

        // Original search functionality
        if (!query && !department_id && !session_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search query or filter parameters'
            });
        }

        // Build filter
        let filter = {};

        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { registration_number: { $regex: query, $options: 'i' } },
                { roll_number: { $regex: query, $options: 'i' } }
            ];
        }

        // Add department filter if provided
        if (department_id) {
            filter.department_id = department_id;
        }

        // Add session filter if provided (checks both admission and current)
        if (session_id) {
            filter.$or = filter.$or || [];
            filter.$or.push(
                { admission_session_id: session_id },
                { current_session_id: session_id }
            );
        }

        // Search students with populated references
        const students = await Student.find(filter)
            .populate([
                { path: 'department_id', select: 'name faculty_id', populate: { path: 'faculty_id', select: 'name' } },
                { path: 'admission_session_id', select: 'name' },
                { path: 'current_session_id', select: 'name' }
            ])
            .limit(20)
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        console.error('Search Students Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add these functions to your admin.controller.js file


// Add new external teacher
exports.addExternalTeacher = async (req, res) => {
    try {
        const { name, email, password, designation, department, university_name, phone } = req.body;

        // Validate input
        if (!name || !email || !password || !designation || !department || !university_name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if external teacher with email already exists
        const existingTeacher = await ExternalTeacher.findOne({ email: email.toLowerCase() });
        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: 'External teacher with this email already exists'
            });
        }

        // Create new external teacher
        const externalTeacher = new ExternalTeacher({
            name,
            email: email.toLowerCase(),
            password,
            designation,
            department,
            university_name,
            phone
        });

        await externalTeacher.save();

        // Remove password from response
        const teacherResponse = externalTeacher.toObject();
        delete teacherResponse.password;

        res.status(201).json({
            success: true,
            message: 'External teacher added successfully',
            externalTeacher: teacherResponse
        });
    } catch (error) {
        console.error('Add External Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all external teachers
exports.getAllExternalTeachers = async (req, res) => {
    try {
        const externalTeachers = await ExternalTeacher.find()
            .select('-password')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: externalTeachers.length,
            externalTeachers
        });
    } catch (error) {
        console.error('Get All External Teachers Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get a single external teacher
exports.getExternalTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const externalTeacher = await ExternalTeacher.findById(id)
            .select('-password');

        if (!externalTeacher) {
            return res.status(404).json({
                success: false,
                message: 'External teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            externalTeacher
        });
    } catch (error) {
        console.error('Get External Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update external teacher
exports.updateExternalTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, designation, department, university_name, phone } = req.body;

        // Find external teacher
        const externalTeacher = await ExternalTeacher.findById(id);
        if (!externalTeacher) {
            return res.status(404).json({
                success: false,
                message: 'External teacher not found'
            });
        }

        // Check for duplicate email if changed
        if (email && email.toLowerCase() !== externalTeacher.email) {
            const existingTeacher = await ExternalTeacher.findOne({
                email: email.toLowerCase(),
                _id: { $ne: id } // Exclude current external teacher
            });

            if (existingTeacher) {
                return res.status(400).json({
                    success: false,
                    message: 'External teacher with this email already exists'
                });
            }
        }

        // Update external teacher
        const updatedTeacher = await ExternalTeacher.findByIdAndUpdate(
            id,
            {
                name: name || externalTeacher.name,
                email: email ? email.toLowerCase() : externalTeacher.email,
                designation: designation || externalTeacher.designation,
                department: department || externalTeacher.department,
                university_name: university_name || externalTeacher.university_name,
                phone: phone || externalTeacher.phone
            },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'External teacher updated successfully',
            externalTeacher: updatedTeacher
        });
    } catch (error) {
        console.error('Update External Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete external teacher
exports.deleteExternalTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const externalTeacher = await ExternalTeacher.findByIdAndDelete(id);

        if (!externalTeacher) {
            return res.status(404).json({
                success: false,
                message: 'External teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'External teacher deleted successfully'
        });
    } catch (error) {
        console.error('Delete External Teacher Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};



// Add exam committee
exports.addExamCommittee = async (req, res) => {
    try {
        const {
            name,
            session_id,
            department_id,
            semesters,
            president_id,
            member_1_id,
            member_2_id
        } = req.body;

        // Validate input
        if (!name || !session_id || !department_id || !semesters || !president_id || !member_1_id || !member_2_id) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if session exists
        const session = await Session.findById(session_id);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Check if department exists
        const department = await Department.findById(department_id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Validate semesters
        const validSemesters = await Semester.find({ _id: { $in: semesters } });
        if (validSemesters.length !== semesters.length) {
            return res.status(404).json({
                success: false,
                message: 'One or more semesters not found'
            });
        }

        // Check if president exists
        const president = await Teacher.findById(president_id);
        if (!president) {
            return res.status(404).json({
                success: false,
                message: 'Committee president not found'
            });
        }

        // Check if member 1 exists
        const member1 = await Teacher.findById(member_1_id);
        if (!member1) {
            return res.status(404).json({
                success: false,
                message: 'Committee member 1 not found'
            });
        }

        // Check if member 2 exists
        const member2 = await ExternalTeacher.findById(member_2_id);
        if (!member2) {
            return res.status(404).json({
                success: false,
                message: 'Committee member 2 not found'
            });
        }

        // Create new exam committee
        const examCommittee = new ExamCommittee({
            name,
            session_id,
            department_id,
            semesters,
            president_id,
            member_1_id,
            member_2_id
        });

        await examCommittee.save();

        // Create approval status records for each semester
        const approvalStatusPromises = semesters.map(semesterId => {
            return new ApprovalStatus({
                exam_committee_id: examCommittee._id,
                semester_id: semesterId,
                internal_mark_status: 'pending',
                external_mark_status: 'pending',
                internal_approved_by: {
                    id: president_id,
                    type: 'Teacher'
                },
                external_approved_by: {
                    id: president_id,
                    type: 'Teacher'
                }
            }).save();
        });

        // Wait for all approval status records to be created
        await Promise.all(approvalStatusPromises);

        // Populate references
        await examCommittee.populate([
            { path: 'session_id', select: 'name' },
            { path: 'department_id', select: 'name' },
            { path: 'semesters', select: 'name' },
            { path: 'president_id', select: 'name email' },
            { path: 'member_1_id', select: 'name email' },
            { path: 'member_2_id', select: 'name email university_name' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Exam committee created successfully with approval status records',
            examCommittee
        });
    } catch (error) {
        console.error('Add Exam Committee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all exam committees
exports.getAllExamCommittees = async (req, res) => {
    try {
        const { department_id, session_id, is_active } = req.query;

        // Build query
        let query = {};

        if (department_id) query.department_id = department_id;
        if (session_id) query.session_id = session_id;
        if (is_active !== undefined) query.is_active = is_active === 'true';

        const examCommittees = await ExamCommittee.find(query)
            .populate([
                { path: 'session_id', select: 'name' },
                { path: 'department_id', select: 'name' },
                { path: 'semesters', select: 'name' },
                { path: 'president_id', select: 'name email' },
                { path: 'member_1_id', select: 'name email' },
                { path: 'member_2_id', select: 'name email university_name' }
            ])
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: examCommittees.length,
            examCommittees
        });
    } catch (error) {
        console.error('Get All Exam Committees Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get single exam committee
exports.getExamCommittee = async (req, res) => {
    try {
        const { id } = req.params;

        const examCommittee = await ExamCommittee.findById(id)
            .populate([
                { path: 'session_id', select: 'name' },
                { path: 'department_id', select: 'name' },
                { path: 'semesters', select: 'name' },
                { path: 'president_id', select: 'name email' },
                { path: 'member_1_id', select: 'name email' },
                { path: 'member_2_id', select: 'name email university_name' }
            ]);

        if (!examCommittee) {
            return res.status(404).json({
                success: false,
                message: 'Exam committee not found'
            });
        }

        res.status(200).json({
            success: true,
            examCommittee
        });
    } catch (error) {
        console.error('Get Exam Committee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update exam committee
exports.updateExamCommittee = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            semesters,
            president_id,
            member_1_id,
            member_2_id,
            is_active
        } = req.body;

        // Find exam committee
        const examCommittee = await ExamCommittee.findById(id);
        if (!examCommittee) {
            return res.status(404).json({
                success: false,
                message: 'Exam committee not found'
            });
        }

        // Validate semesters if provided
        if (semesters) {
            const validSemesters = await Semester.find({ _id: { $in: semesters } });
            if (validSemesters.length !== semesters.length) {
                return res.status(404).json({
                    success: false,
                    message: 'One or more semesters not found'
                });
            }
        }

        // Check if president exists if provided
        if (president_id) {
            const president = await Teacher.findById(president_id);
            if (!president) {
                return res.status(404).json({
                    success: false,
                    message: 'Committee president not found'
                });
            }
        }

        // Check if member 1 exists if provided
        if (member_1_id) {
            const member1 = await Teacher.findById(member_1_id);
            if (!member1) {
                return res.status(404).json({
                    success: false,
                    message: 'Committee member 1 not found'
                });
            }
        }

        // Check if member 2 exists if provided
        if (member_2_id) {
            const member2 = await ExternalTeacher.findById(member_2_id);
            if (!member2) {
                return res.status(404).json({
                    success: false,
                    message: 'Committee member 2 not found'
                });
            }
        }

        const updatedCommittee = await ExamCommittee.findByIdAndUpdate(
            id,
            {
                name: name || examCommittee.name,
                semesters: semesters || examCommittee.semesters,
                president_id: president_id || examCommittee.president_id,
                member_1_id: member_1_id || examCommittee.member_1_id,
                member_2_id: member_2_id || examCommittee.member_2_id,
                is_active: is_active !== undefined ? is_active : examCommittee.is_active
            },
            { new: true, runValidators: true }
        ).populate([
            { path: 'session_id', select: 'name' },
            { path: 'department_id', select: 'name' },
            { path: 'semesters', select: 'name' },
            { path: 'president_id', select: 'name email' },
            { path: 'member_1_id', select: 'name email' },
            { path: 'member_2_id', select: 'name email university_name' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Exam committee updated successfully',
            examCommittee: updatedCommittee
        });
    } catch (error) {
        console.error('Update Exam Committee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete exam committee
exports.deleteExamCommittee = async (req, res) => {
    try {
        const { id } = req.params;

        const examCommittee = await ExamCommittee.findByIdAndDelete(id);

        if (!examCommittee) {
            return res.status(404).json({
                success: false,
                message: 'Exam committee not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Exam committee deleted successfully'
        });
    } catch (error) {
        console.error('Delete Exam Committee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add course assignment
exports.addCourseAssignment = async (req, res) => {
    try {
        const {
            exam_committee_id,
            semester_id,
            course_id,
            first_examiner_id,
            first_examiner_type,
            second_examiner_id,
            second_examiner_type,
            third_examiner_id,
            third_examiner_type
        } = req.body;

        // Validate required fields
        if (!exam_committee_id || !semester_id || !course_id ||
            !first_examiner_id || !first_examiner_type ||
            !second_examiner_id || !second_examiner_type) {
            return res.status(400).json({
                success: false,
                message: 'Required fields are missing'
            });
        }

        // Check if exam committee exists and is active
        const examCommittee = await ExamCommittee.findOne({
            _id: exam_committee_id,
            is_active: true
        });
        if (!examCommittee) {
            return res.status(404).json({
                success: false,
                message: 'Active exam committee not found'
            });
        }

        // Verify semester belongs to exam committee
        if (!examCommittee.semesters.includes(semester_id)) {
            return res.status(400).json({
                success: false,
                message: 'Semester is not assigned to this exam committee'
            });
        }

        // Check if course exists
        const course = await Course.findById(course_id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if a course assignment already exists for the same committee, semester, and course
        const existingAssignment = await CourseAssignment.findOne({
            exam_committee_id,
            semester_id,
            course_id
        });

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message: 'Course assignment already exists for this committee, semester, and course'
            });
        }

        // Verify examiners exist
        let firstExaminer, secondExaminer, thirdExaminer;

        if (first_examiner_type === 'Teacher') {
            firstExaminer = await Teacher.findById(first_examiner_id);
        } else {
            firstExaminer = await ExternalTeacher.findById(first_examiner_id);
        }

        if (!firstExaminer) {
            return res.status(404).json({
                success: false,
                message: 'First examiner not found'
            });
        }

        if (second_examiner_type === 'Teacher') {
            secondExaminer = await Teacher.findById(second_examiner_id);
        } else {
            secondExaminer = await ExternalTeacher.findById(second_examiner_id);
        }

        if (!secondExaminer) {
            return res.status(404).json({
                success: false,
                message: 'Second examiner not found'
            });
        }

        if (third_examiner_id) {
            if (third_examiner_type === 'Teacher') {
                thirdExaminer = await Teacher.findById(third_examiner_id);
            } else {
                thirdExaminer = await ExternalTeacher.findById(third_examiner_id);
            }

            if (!thirdExaminer) {
                return res.status(404).json({
                    success: false,
                    message: 'Third examiner not found'
                });
            }
        }

        // Create course assignment
        // Create course assignment
        const courseAssignmentData = {
            exam_committee_id,
            semester_id,
            course_id,
            first_examiner_id,
            first_examiner_type,
            second_examiner_id,
            second_examiner_type,
            third_examiner_id: null,
            third_examiner_type: null
        };

        // Only add third examiner if provided
        if (third_examiner_id) {
            courseAssignmentData.third_examiner_id = third_examiner_id;
            courseAssignmentData.third_examiner_type = third_examiner_type;
        }

        const courseAssignment = new CourseAssignment(courseAssignmentData);

        await courseAssignment.save();


        const students = await Student.find({
            current_session_id: examCommittee.session_id._id,
            department_id: examCommittee.department_id
        });


        // Create exam entries for each student with internal and external exams
        const examPromises = students.map(async student => {
            // Create main exam entry
            const exam = new Exam({
                course_assignment_id: courseAssignment._id,
                student_id: student._id,
                student_type: 'regular',
                status: 'pending'
            });

            // Save the main exam entry
            await exam.save();

            // Create internal exam entry
            const internalExam = new InternalExam({
                exam_id: exam._id
            });

            // Create external exam entry
            const externalExam = new ExternalExam({
                exam_id: exam._id
            });

            // Save both internal and external exam entries
            await Promise.all([
                internalExam.save(),
                externalExam.save()
            ]);

            return exam;
        });

        // Wait for all exam entries to be created
        const createdExams = await Promise.all(examPromises);

        // Populate references for course assignment
        await courseAssignment.populate([
            {
                path: 'exam_committee_id',
                select: 'name session_id department_id',
                populate: [
                    { path: 'session_id', select: 'name' },
                    { path: 'department_id', select: 'name' }
                ]
            },
            { path: 'semester_id', select: 'name' },
            { path: 'course_id', select: 'course_code course_name credit' },
            {
                path: 'first_examiner_id',
                select: 'name email designation',
                refPath: 'first_examiner_type'
            },
            {
                path: 'second_examiner_id',
                select: 'name email designation',
                refPath: 'second_examiner_type'
            },
            {
                path: 'third_examiner_id',
                select: 'name email designation',
                refPath: 'third_examiner_type'
            }
        ]);

        // Add count of internal and external exams created to response
        res.status(201).json({
            success: true,
            message: 'Course assignment created successfully with exam entries',
            courseAssignment,
            examsCreated: {
                total: createdExams.length,
                withInternalAndExternal: true
            }
        });
    } catch (error) {
        console.error('Add Course Assignment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all course assignments
exports.getAllCourseAssignments = async (req, res) => {
    try {
        const { exam_committee_id, semester_id, course_id } = req.query;

        // Build query
        let query = {};
        if (exam_committee_id) query.exam_committee_id = exam_committee_id;
        if (semester_id) query.semester_id = semester_id;
        if (course_id) query.course_id = course_id;

        const courseAssignments = await CourseAssignment.find(query)
            .populate([
                {
                    path: 'exam_committee_id',
                    select: 'name session_id department_id',
                    populate: [
                        { path: 'session_id', select: 'name' },
                        { path: 'department_id', select: 'name' }
                    ]
                },
                { path: 'semester_id', select: 'name' },
                { path: 'course_id', select: 'course_code course_name credit' },
                {
                    path: 'first_examiner_id',
                    select: 'name email designation',
                    refPath: 'first_examiner_type'
                },
                {
                    path: 'second_examiner_id',
                    select: 'name email designation',
                    refPath: 'second_examiner_type'
                },
                {
                    path: 'third_examiner_id',
                    select: 'name email designation',
                    refPath: 'third_examiner_type'
                }
            ])
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: courseAssignments.length,
            courseAssignments
        });
    } catch (error) {
        console.error('Get All Course Assignments Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get single course assignment
exports.getCourseAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        const courseAssignment = await CourseAssignment.findById(id)
            .populate([
                {
                    path: 'exam_committee_id',
                    select: 'name session_id department_id',
                    populate: [
                        { path: 'session_id', select: 'name' },
                        { path: 'department_id', select: 'name' }
                    ]
                },
                { path: 'semester_id', select: 'name' },
                { path: 'course_id', select: 'course_code course_name credit' },
                {
                    path: 'first_examiner_id',
                    select: 'name email designation',
                    refPath: 'first_examiner_type'
                },
                {
                    path: 'second_examiner_id',
                    select: 'name email designation',
                    refPath: 'second_examiner_type'
                },
                {
                    path: 'third_examiner_id',
                    select: 'name email designation',
                    refPath: 'third_examiner_type'
                }
            ]);

        if (!courseAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Course assignment not found'
            });
        }

        res.status(200).json({
            success: true,
            courseAssignment
        });
    } catch (error) {
        console.error('Get Course Assignment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Update course assignment
exports.updateCourseAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            first_examiner_id,
            first_examiner_type,
            second_examiner_id,
            second_examiner_type,
            third_examiner_id,
            third_examiner_type
        } = req.body;

        // Find course assignment
        const courseAssignment = await CourseAssignment.findById(id);
        if (!courseAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Course assignment not found'
            });
        }

        // Verify examiners exist if provided
        if (first_examiner_id && first_examiner_type) {
            let firstExaminer;
            if (first_examiner_type === 'Teacher') {
                firstExaminer = await Teacher.findById(first_examiner_id);
            } else {
                firstExaminer = await ExternalTeacher.findById(first_examiner_id);
            }

            if (!firstExaminer) {
                return res.status(404).json({
                    success: false,
                    message: 'First examiner not found'
                });
            }
        }

        if (second_examiner_id && second_examiner_type) {
            let secondExaminer;
            if (second_examiner_type === 'Teacher') {
                secondExaminer = await Teacher.findById(second_examiner_id);
            } else {
                secondExaminer = await ExternalTeacher.findById(second_examiner_id);
            }

            if (!secondExaminer) {
                return res.status(404).json({
                    success: false,
                    message: 'Second examiner not found'
                });
            }
        }

        if (third_examiner_id && third_examiner_type) {
            let thirdExaminer;
            if (third_examiner_type === 'Teacher') {
                thirdExaminer = await Teacher.findById(third_examiner_id);
            } else {
                thirdExaminer = await ExternalTeacher.findById(third_examiner_id);
            }

            if (!thirdExaminer) {
                return res.status(404).json({
                    success: false,
                    message: 'Third examiner not found'
                });
            }
        }

        // Update course assignment
        const updatedAssignment = await CourseAssignment.findByIdAndUpdate(
            id,
            {
                first_examiner_id: first_examiner_id || courseAssignment.first_examiner_id,
                first_examiner_type: first_examiner_type || courseAssignment.first_examiner_type,
                second_examiner_id: second_examiner_id || courseAssignment.second_examiner_id,
                second_examiner_type: second_examiner_type || courseAssignment.second_examiner_type,
                third_examiner_id: third_examiner_id || courseAssignment.third_examiner_id,
                third_examiner_type: third_examiner_type || courseAssignment.third_examiner_type
            },
            { new: true, runValidators: true }
        ).populate([
            {
                path: 'exam_committee_id',
                select: 'name session_id department_id',
                populate: [
                    { path: 'session_id', select: 'name' },
                    { path: 'department_id', select: 'name' }
                ]
            },
            { path: 'semester_id', select: 'name' },
            { path: 'course_id', select: 'course_code course_name credit' },
            {
                path: 'first_examiner_id',
                select: 'name email designation',
                refPath: 'first_examiner_type'
            },
            {
                path: 'second_examiner_id',
                select: 'name email designation',
                refPath: 'second_examiner_type'
            },
            {
                path: 'third_examiner_id',
                select: 'name email designation',
                refPath: 'third_examiner_type'
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Course assignment updated successfully',
            courseAssignment: updatedAssignment
        });
    } catch (error) {
        console.error('Update Course Assignment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete course assignment
exports.deleteCourseAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const courseAssignment = await CourseAssignment.findById(id);
        if (!courseAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Course assignment not found'
            });
        }

        // Check if any exams are associated with this assignment

        const examExists = await Exam.findOne({ course_assignment_id: id });
        if (examExists) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete course assignment with associated exams'
            });
        }

        await CourseAssignment.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Course assignment deleted successfully'
        });
    } catch (error) {
        console.error('Delete Course Assignment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Add improvement exam for student
exports.addImprovementExam = async (req, res) => {
    try {
        const { course_assignment_id, student_id } = req.body;

        // Validate required fields
        if (!course_assignment_id || !student_id) {
            return res.status(400).json({
                success: false,
                message: 'Course assignment and student IDs are required'
            });
        }

        // Check if course assignment exists
        const courseAssignment = await CourseAssignment.findById(course_assignment_id)
            .populate({
                path: 'exam_committee_id',
                populate: [
                    { path: 'session_id' },
                    { path: 'department_id' }
                ]
            })
            .populate('course_id');

        if (!courseAssignment) {
            return res.status(404).json({
                success: false,
                message: 'Course assignment not found'
            });
        }

        // Check if the exam committee is active
        if (!courseAssignment.exam_committee_id.is_active) {
            return res.status(400).json({
                success: false,
                message: 'Cannot add improvement exam for inactive exam committee'
            });
        }

        // Check if student exists
        const student = await Student.findById(student_id)
            .populate('current_session_id department_id');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check if student already has an exam entry for this course assignment
        const existingExam = await Exam.findOne({
            course_assignment_id,
            student_id
        });

        if (existingExam) {
            return res.status(400).json({
                success: false,
                message: 'Student already has an exam entry for this course'
            });
        }

        // Find all course assignments for the same course in the student's department
        const departmentId = student.department_id._id;
        const courseId = courseAssignment.course_id._id;

        const allDepartmentCommittees = await ExamCommittee.find({
            department_id: departmentId
        }).select('_id');

        const committeeIds = allDepartmentCommittees.map(comm => comm._id);

        const allCourseAssignments = await CourseAssignment.find({
            exam_committee_id: { $in: committeeIds },
            course_id: courseId
        }).select('_id');

        const assignmentIds = allCourseAssignments.map(ca => ca._id);

        // Find the original regular exam for this student and course
        const originalExam = await Exam.findOne({
            student_id,
            course_assignment_id: { $in: assignmentIds },
            student_type: 'regular'
        });

        if (!originalExam) {
            return res.status(404).json({
                success: false,
                message: 'No regular exam found for this student and course. Cannot create improvement exam.'
            });
        }

        // Get original internal marks
        const originalInternalExam = await InternalExam.findOne({
            exam_id: originalExam._id
        });

        if (!originalInternalExam) {
            return res.status(404).json({
                success: false,
                message: 'No internal marks found for the original exam'
            });
        }

        // Create new exam entry
        const exam = new Exam({
            course_assignment_id,
            student_id,
            student_type: 'improve',
            status: 'pending'
        });

        await exam.save();

        // Create external exam entry
        const externalExam = new ExternalExam({
            exam_id: exam._id
        });

        // Create internal exam entry with the same marks as the original
        const internalExam = new InternalExam({
            exam_id: exam._id,
            first_exam_mark: originalInternalExam.first_exam_mark,
            second_exam_mark: originalInternalExam.second_exam_mark,
            third_exam_mark: originalInternalExam.third_exam_mark,
            attendance_mark: originalInternalExam.attendance_mark,
            submitted_by: originalInternalExam.submitted_by,
            submitted_at: new Date()
        });

        await Promise.all([
            externalExam.save(),
            internalExam.save()
        ]);

        // Populate the exam details
        await exam.populate([
            {
                path: 'course_assignment_id',
                populate: [
                    {
                        path: 'exam_committee_id',
                        populate: [
                            { path: 'session_id', select: 'name' },
                            { path: 'department_id', select: 'name' }
                        ]
                    },
                    { path: 'course_id', select: 'course_code course_name credit' }
                ]
            },
            {
                path: 'student_id',
                select: 'name registration_number roll_number',
                populate: [
                    { path: 'department_id', select: 'name' },
                    { path: 'current_session_id', select: 'name' }
                ]
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Improvement exam entry created successfully with internal marks copied from original exam',
            exam,
            internalMarks: {
                copied_from_regular_exam: true,
                first_exam_mark: internalExam.first_exam_mark,
                second_exam_mark: internalExam.second_exam_mark,
                third_exam_mark: internalExam.third_exam_mark,
                attendance_mark: internalExam.attendance_mark
            }
        });

    } catch (error) {
        console.error('Add Improvement Exam Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get all improvement exams
exports.getImprovementExams = async (req, res) => {
    try {
        const { course_assignment_id } = req.query;

        let query = { student_type: 'improve' };
        if (course_assignment_id) {
            query.course_assignment_id = course_assignment_id;
        }

        const exams = await Exam.find(query)
            .populate([
                {
                    path: 'course_assignment_id',
                    populate: [
                        {
                            path: 'exam_committee_id',
                            populate: [
                                { path: 'session_id', select: 'name' },
                                { path: 'department_id', select: 'name' }
                            ]
                        },
                        { path: 'course_id', select: 'course_code course_name credit' }
                    ]
                },
                {
                    path: 'student_id',
                    select: 'name registration_number roll_number',
                    populate: [
                        { path: 'department_id', select: 'name' },
                        { path: 'current_session_id', select: 'name' }
                    ]
                }
            ])
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            exams
        });

    } catch (error) {
        console.error('Get Improvement Exams Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Delete improvement exam
exports.deleteImprovementExam = async (req, res) => {
    try {
        const { id } = req.params;

        // Find and verify the exam
        const exam = await Exam.findById(id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        if (exam.student_type !== 'improve') {
            return res.status(400).json({
                success: false,
                message: 'Can only delete improvement exams'
            });
        }

        // Delete related internal and external exams
        await Promise.all([
            InternalExam.deleteOne({ exam_id: exam._id }),
            ExternalExam.deleteOne({ exam_id: exam._id }),
            Exam.deleteOne({ _id: exam._id })
        ]);

        res.status(200).json({
            success: true,
            message: 'Improvement exam deleted successfully'
        });

    } catch (error) {
        console.error('Delete Improvement Exam Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getComprehensiveExamData = async (req, res) => {
    try {
        // Get query parameters for filtering
        const {
            committee_id,
            course_id,
            student_id,
            semester_id,
            session_id,
            department_id
        } = req.query;

        // Step 1: Build query for exams based on parameters
        let examQuery = {};

        // If student_id is specified, filter by that student
        if (student_id) {
            examQuery.student_id = student_id;
        }

        // Step 2: If we have course_assignment related filters, first get matching course assignments
        if (committee_id || course_id || semester_id || department_id || session_id) {
            let courseAssignmentQuery = {};

            if (committee_id) courseAssignmentQuery.exam_committee_id = committee_id;
            if (course_id) courseAssignmentQuery.course_id = course_id;
            if (semester_id) courseAssignmentQuery.semester_id = semester_id;

            // For session filtering, find committees in that session
            if (session_id) {
                const committeeIds = await ExamCommittee.find({ session_id }).distinct('_id');
                courseAssignmentQuery.exam_committee_id = { $in: committeeIds };
            }

            // Get matching course assignment IDs
            const courseAssignments = await CourseAssignment.find(courseAssignmentQuery)
                .populate({
                    path: 'exam_committee_id',
                    select: 'name department_id session_id status',
                    populate: [
                        { path: 'department_id', select: 'name' },
                        { path: 'session_id', select: 'name' }
                    ]
                });

            // Filter by department or session if provided
            const filteredAssignments = courseAssignments.filter(assignment => {
                if (department_id &&
                    assignment.exam_committee_id?.department_id?._id.toString() !== department_id) {
                    return false;
                }
                if (session_id &&
                    assignment.exam_committee_id?.session_id?._id.toString() !== session_id) {
                    return false;
                }
                return true;
            });

            // Get IDs of filtered course assignments
            const courseAssignmentIds = filteredAssignments.map(ca => ca._id);

            // Add to exam query
            if (courseAssignmentIds.length > 0) {
                examQuery.course_assignment_id = { $in: courseAssignmentIds };
            } else {
                // No matching course assignments found
                return res.status(200).json({
                    success: true,
                    count: 0,
                    data: []
                });
            }
        }

        // Step 3: Get exams with all necessary related data
        const exams = await Exam.find(examQuery)
            .populate({
                path: 'course_assignment_id',
                select: 'exam_committee_id semester_id course_id first_examiner_id first_examiner_type second_examiner_id second_examiner_type third_examiner_id third_examiner_type',
                populate: [
                    {
                        path: 'exam_committee_id',
                        select: 'name department_id session_id status',
                        populate: [
                            { path: 'department_id', select: 'name' },
                            { path: 'session_id', select: 'name' }
                        ]
                    },
                    { path: 'semester_id', select: 'name' },
                    { path: 'course_id', select: 'course_code course_name credit' },
                    {
                        path: 'first_examiner_id',
                        select: 'name email designation department_id university',
                        refPath: 'first_examiner_type'
                    },
                    {
                        path: 'second_examiner_id',
                        select: 'name email designation department_id university',
                        refPath: 'second_examiner_type'
                    },
                    {
                        path: 'third_examiner_id',
                        select: 'name email designation department_id university',
                        refPath: 'third_examiner_type'
                    }
                ]
            })
            .populate({
                path: 'student_id',
                select: 'name registration_number roll_number department_id',
                populate: { path: 'department_id', select: 'name' }
            });
        // Step 4: Get internal and external exam data for each exam
        const comprehensiveData = await Promise.all(exams.map(async (exam) => {
            const internalExam = await InternalExam.findOne({ exam_id: exam._id })
                .populate('submitted_by', 'name');

            const externalExam = await ExternalExam.findOne({ exam_id: exam._id })
                .populate({ path: 'first_submitted_by', select: 'name' })
                .populate({ path: 'second_submitted_by', select: 'name' })
                .populate({ path: 'third_submitted_by', select: 'name' })
            // Calculate total internal marks
            const internalTotal = internalExam ? (
                (internalExam.first_exam_mark || 0) +
                (internalExam.second_exam_mark || 0) +
                (internalExam.third_exam_mark || 0) +
                (internalExam.attendance_mark || 0)
            ) : 0;

            // Calculate average external marks
            let externalAverage = 0;

            if (externalExam) {
                if (externalExam.is_third_examiner_required && externalExam.third_examiner_mark !== null) {
                    const firstMark = externalExam.first_examiner_mark || 0;
                    const secondMark = externalExam.second_examiner_mark || 0;
                    const thirdMark = externalExam.third_examiner_mark || 0;

                    // Calculate differences between all pairs
                    const diff12 = Math.abs(firstMark - secondMark);
                    const diff13 = Math.abs(firstMark - thirdMark);
                    const diff23 = Math.abs(secondMark - thirdMark);

                    // Find which two examiners have the closest marks
                    if (diff12 <= diff13 && diff12 <= diff23) {
                        // First and second are closest
                        externalAverage = (firstMark + secondMark) / 2;
                    } else if (diff13 <= diff12 && diff13 <= diff23) {
                        // First and third are closest
                        externalAverage = (firstMark + thirdMark) / 2;
                    } else {
                        // Second and third are closest
                        externalAverage = (secondMark + thirdMark) / 2;
                    }
                } else if (externalExam.first_examiner_mark !== null && externalExam.second_examiner_mark !== null) {
                    // Average of first two examiners
                    externalAverage = (externalExam.first_examiner_mark + externalExam.second_examiner_mark) / 2;
                } else if (externalExam.first_examiner_mark !== null) {
                    externalAverage = externalExam.first_examiner_mark;
                } else if (externalExam.second_examiner_mark !== null) {
                    externalAverage = externalExam.second_examiner_mark;
                } else if (externalExam.third_examiner_mark !== null) {
                    externalAverage = externalExam.third_examiner_mark;
                }
            }

            // Calculate final marks (external 70% + internal 30%)
            const finalMarks = (externalAverage + internalTotal); // Internal is out of 40, scaling to 30
            return {
                exam_id: exam._id,
                committee: {
                    id: exam.course_assignment_id?.exam_committee_id?._id,
                    name: exam.course_assignment_id?.exam_committee_id?.name,
                    department: exam.course_assignment_id?.exam_committee_id?.department_id?.name,
                    session: exam.course_assignment_id?.exam_committee_id?.session_id?.name,
                    status: exam.course_assignment_id?.exam_committee_id?.status
                },
                course: {
                    id: exam.course_assignment_id?.course_id?._id,
                    code: exam.course_assignment_id?.course_id?.course_code,
                    name: exam.course_assignment_id?.course_id?.course_name,
                    credit: exam.course_assignment_id?.course_id?.credit
                },
                semester: exam.course_assignment_id?.semester_id?.name,
                student: {
                    id: exam.student_id?._id,
                    name: exam.student_id?.name,
                    registration_number: exam.student_id?.registration_number,
                    roll_number: exam.student_id?.roll_number,
                    department: exam.student_id?.department_id?.name,
                    type: exam.student_type  // regular or improve
                },
                examiners: {
                    first: {
                        id: exam.course_assignment_id?.first_examiner_id?._id,
                        name: exam.course_assignment_id?.first_examiner_id?.name,
                        type: exam.course_assignment_id?.first_examiner_type,
                        designation: exam.course_assignment_id?.first_examiner_id?.designation,
                        university: exam.course_assignment_id?.first_examiner_id?.university
                    },
                    second: {
                        id: exam.course_assignment_id?.second_examiner_id?._id,
                        name: exam.course_assignment_id?.second_examiner_id?.name,
                        type: exam.course_assignment_id?.second_examiner_type,
                        designation: exam.course_assignment_id?.second_examiner_id?.designation,
                        university: exam.course_assignment_id?.second_examiner_id?.university
                    },
                    third: exam.course_assignment_id?.third_examiner_id ? {
                        id: exam.course_assignment_id?.third_examiner_id?._id,
                        name: exam.course_assignment_id?.third_examiner_id?.name,
                        type: exam.course_assignment_id?.third_examiner_type,
                        designation: exam.course_assignment_id?.third_examiner_id?.designation,
                        university: exam.course_assignment_id?.third_examiner_id?.university
                    } : null
                },
                internal_marks: {
                    first_exam: internalExam?.first_exam_mark || 0,
                    second_exam: internalExam?.second_exam_mark || 0,
                    third_exam: internalExam?.third_exam_mark || 0,
                    attendance: internalExam?.attendance_mark || 0,
                    total: internalTotal,
                    submitted_by: internalExam?.submitted_by?.name,
                    submitted_at: internalExam?.submitted_at
                },
                external_marks: {
                    first_examiner: externalExam?.first_examiner_mark || 0,
                    second_examiner: externalExam?.second_examiner_mark || 0,
                    third_examiner: externalExam?.third_examiner_mark || 0,
                    is_third_required: externalExam?.is_third_examiner_required || false,
                    average: externalAverage,
                    first_submitted_by: externalExam?.first_submitted_by?.name,
                    second_submitted_by: externalExam?.second_submitted_by?.name,
                    third_submitted_by: externalExam?.third_submitted_by?.name,
                    // Add submission dates
                    first_submitted_at: externalExam?.first_submitted_at,
                    second_submitted_at: externalExam?.second_submitted_at,
                    third_submitted_at: externalExam?.third_submitted_at,
                    // Add fallback information for third examiner when mark exists but name doesn't
                    third_examiner_info: externalExam?.third_examiner_mark && !externalExam?.third_submitted_by?.name ? {
                        inferred_name: exam.course_assignment_id?.third_examiner_id?.name || 'External Examiner',
                        inferred_type: exam.course_assignment_id?.third_examiner_type
                    } : null
                },
                final_marks: finalMarks,
                grade: calculateGrade(finalMarks),
                status: exam.status
            };
        }));

        // Step 5: Group data by course_assignment_id for better organization (optional)
        const groupedData = {};

        comprehensiveData.forEach(examData => {
            const courseAssignmentId = examData.course.id.toString();

            if (!groupedData[courseAssignmentId]) {
                groupedData[courseAssignmentId] = {
                    committee: examData.committee,
                    course: examData.course,
                    semester: examData.semester,
                    examiners: examData.examiners,
                    students: []
                };
            }

            groupedData[courseAssignmentId].students.push({
                student: examData.student,
                exam_id: examData.exam_id,
                internal_marks: examData.internal_marks,
                external_marks: examData.external_marks,
                final_marks: examData.final_marks,
                grade: examData.grade,
                status: examData.status
            });
        });

        res.status(200).json({
            success: true,
            count: comprehensiveData.length,
            individual_data: comprehensiveData,
            grouped_data: Object.values(groupedData)
        });

    } catch (error) {
        console.error('Comprehensive Exam Data Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function to calculate grade
function calculateGrade(param1, param2) {
    // Case 1: Single parameter (just the final marks value)
    if (param2 === undefined) {
        const marks = param1;
        if (marks === undefined || marks === null) return { letter: 'N/A', point: 0 };

        if (marks >= 80) return { letter: 'A+', point: 4.00 };
        if (marks >= 75) return { letter: 'A', point: 3.75 };
        if (marks >= 70) return { letter: 'A-', point: 3.50 };
        if (marks >= 65) return { letter: 'B+', point: 3.25 };
        if (marks >= 60) return { letter: 'B', point: 3.00 };
        if (marks >= 55) return { letter: 'B-', point: 2.75 };
        if (marks >= 50) return { letter: 'C+', point: 2.50 };
        if (marks >= 45) return { letter: 'C', point: 2.25 };
        if (marks >= 40) return { letter: 'D', point: 2.00 };
        return { letter: 'F', point: 0.00 };
    }

    // Case 2: Two parameters (internalMarks, externalMarks)
    const internalMarks = param1;
    const externalMarks = param2;

    if (!internalMarks || !externalMarks) return { letter: 'N/A', point: 0 };

    // Your existing two-parameter logic
    const internalTotal = (internalMarks.first_exam_mark || 0) +
        (internalMarks.second_exam_mark || 0) +
        (internalMarks.third_exam_mark || 0) +
        (internalMarks.attendance_mark || 0);

    const externalTotal = calculateFinalMark(externalMarks);
    const totalMarks = internalTotal + externalTotal;

    // Use the same grade ranges as the single-parameter case
    if (totalMarks >= 80) return { letter: 'A+', point: 4.00 };
    if (totalMarks >= 75) return { letter: 'A', point: 3.75 };
    if (totalMarks >= 70) return { letter: 'A-', point: 3.50 };
    if (totalMarks >= 65) return { letter: 'B+', point: 3.25 };
    if (totalMarks >= 60) return { letter: 'B', point: 3.00 };
    if (totalMarks >= 55) return { letter: 'B-', point: 2.75 };
    if (totalMarks >= 50) return { letter: 'C+', point: 2.50 };
    if (totalMarks >= 45) return { letter: 'C', point: 2.25 };
    if (totalMarks >= 40) return { letter: 'D', point: 2.00 };
    return { letter: 'F', point: 0.00 };
}

// Get dashboard counts for admin dashboard
exports.getDashboardCounts = async (req, res) => {
    try {
        // Use Promise.all to run all count queries in parallel for better performance
        const [
            facultyCount,
            departmentCount,
            sessionCount,
            semesterCount,
            courseCount,
            studentCount,
            teacherCount,
            externalTeacherCount,
            examCommitteeCount,
            courseAssignmentCount
        ] = await Promise.all([
            Faculty.countDocuments(),
            Department.countDocuments(),
            Session.countDocuments(),
            Semester.countDocuments(),
            Course.countDocuments(),
            Student.countDocuments(),
            Teacher.countDocuments(),
            ExternalTeacher.countDocuments(),
            ExamCommittee.countDocuments(),
            CourseAssignment.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            counts: {
                faculties: facultyCount,
                departments: departmentCount,
                sessions: sessionCount,
                semesters: semesterCount,
                courses: courseCount,
                students: studentCount,
                teachers: teacherCount,
                externalTeachers: externalTeacherCount,
                examCommittees: examCommitteeCount,
                courseAssignments: courseAssignmentCount
            }
        });
    } catch (error) {
        console.error('Dashboard Counts Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard counts',
            error: error.message
        });
    }
};
// Get approval statuses
exports.getApprovalStatus = async (req, res) => {
    try {
        const { exam_committee_id, semester_id } = req.query;

        // Build query based on provided filters
        const query = {};
        if (exam_committee_id) query.exam_committee_id = exam_committee_id;
        if (semester_id) query.semester_id = semester_id;

        // Get approval statuses with populated references
        const approvalStatuses = await ApprovalStatus.find(query)
            .populate({
                path: 'exam_committee_id',
                select: 'name department_id session_id',
                populate: [
                    { path: 'department_id', select: 'name' },
                    { path: 'session_id', select: 'name' }
                ]
            })
            .populate('semester_id', 'name')
            .populate({
                path: 'internal_approved_by.id',
                select: 'name email',
                refPath: 'internal_approved_by.type'  // This is correct - keep it
            })
            .populate({
                path: 'external_approved_by.id',
                select: 'name email',
                refPath: 'external_approved_by.type'  // This is correct - keep it
            })
            .sort({ createdAt: -1 });

        // Add formatted details for easier client consumption
        const formattedStatuses = approvalStatuses.map(status => {
            return {
                _id: status._id,
                exam_committee: {
                    _id: status.exam_committee_id?._id,
                    name: status.exam_committee_id?.name,
                    department: status.exam_committee_id?.department_id?.name,
                    session: status.exam_committee_id?.session_id?.name
                },
                semester: {
                    _id: status.semester_id?._id,
                    name: status.semester_id?.name
                },
                internal_marks: {
                    status: status.internal_mark_status,
                    approved_by: status.internal_approved_by?.id ? {
                        _id: status.internal_approved_by.id?._id,
                        name: status.internal_approved_by.id?.name,
                        email: status.internal_approved_by.id?.email,
                        type: status.internal_approved_by.type
                    } : null,
                    approval_date: status.internal_approval_date
                },
                external_marks: {
                    status: status.external_mark_status,
                    approved_by: status.external_approved_by?.id ? {
                        _id: status.external_approved_by.id?._id,
                        name: status.external_approved_by.id?.name,
                        email: status.external_approved_by.id?.email,
                        type: status.external_approved_by.type
                    } : null,
                    approval_date: status.external_approval_date
                },
                comments: status.comments,
                createdAt: status.createdAt,
                updatedAt: status.updatedAt
            };
        });

        res.status(200).json({
            success: true,
            count: approvalStatuses.length,
            approvalStatuses: formattedStatuses
        });
    } catch (error) {
        console.error('Get Approval Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};
// Controller function for retrieving exams with filters
exports.getExams = async (req, res) => {
    try {
        // Extract query parameters
        const {
            student_id,
            semester_id,
            session_id,
            committee_id,
            course_id,
            student_type
        } = req.query;

        // Build query object based on provided filters
        const query = {};
        if (student_id) query.student_id = student_id;
        if (course_id) query.course_assignment_id = { $in: await CourseAssignment.find({ course_id }).distinct('_id') };
        if (student_type) query.student_type = student_type;

        // For semester or session filtering, need to find relevant course assignments first
        if (semester_id || session_id || committee_id) {
            const caQuery = {};
            if (semester_id) caQuery.semester_id = semester_id;
            if (committee_id) caQuery.exam_committee_id = committee_id;

            // For session filtering, find committees in that session
            if (session_id) {
                const committeeIds = await ExamCommittee.find({ session_id }).distinct('_id');
                caQuery.exam_committee_id = { $in: committeeIds };
            }

            // Get matching course assignment IDs
            const caIds = await CourseAssignment.find(caQuery).distinct('_id');
            query.course_assignment_id = { $in: caIds };
        }

        // Execute the query with essential population
        const exams = await Exam.find(query)
            .populate({
                path: 'course_assignment_id',
                populate: [
                    { path: 'course_id', select: 'course_code course_name credit' },
                    { path: 'semester_id', select: 'name' },
                    { path: 'exam_committee_id', select: 'name session_id' }
                ]
            })
            .populate('student_id', 'name registration_number roll_number')
            .populate('internalExam')
            .populate('externalExam')
            .sort({ 'student_id.roll_number': 1, 'course_assignment_id.course_id.course_code': 1 });

        res.status(200).json({
            success: true,
            count: exams.length,
            exams
        });
    } catch (error) {
        console.error('Get Exams Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving exams',
            error: error.message
        });
    }
};

// Get all exam results for a specific student
exports.getStudentResults = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { semester_id, session_id, include_improvements } = req.query;

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Build base query for student exams
        const query = {
            student_id: studentId,
            student_type: 'regular'
        };

        // Add improvement exams if requested
        if (include_improvements === 'true') {
            query.student_type = { $in: ['regular', 'improve'] };
        }

        // Filter by semester if provided
        if (semester_id) {
            const caIds = await CourseAssignment.find({ semester_id }).distinct('_id');
            query.course_assignment_id = { $in: caIds };
        }

        // Filter by session if provided
        if (session_id) {
            const committeeIds = await ExamCommittee.find({ session_id }).distinct('_id');
            const caIds = await CourseAssignment.find({ exam_committee_id: { $in: committeeIds } }).distinct('_id');

            // If semester was already specified, intersect the two conditions
            if (query.course_assignment_id) {
                query.course_assignment_id = {
                    $in: await CourseAssignment.find({
                        _id: { $in: query.course_assignment_id.$in },
                        exam_committee_id: { $in: committeeIds }
                    }).distinct('_id')
                };
            } else {
                query.course_assignment_id = { $in: caIds };
            }
        }

        // Fetch exams with all necessary data
        const exams = await Exam.find(query)
            .populate({
                path: 'course_assignment_id',
                populate: [
                    { path: 'course_id', select: 'course_code course_name credit' },
                    { path: 'semester_id', select: 'name' },
                    {
                        path: 'exam_committee_id',
                        select: 'name session_id',
                        populate: { path: 'session_id', select: 'name' }
                    }
                ]
            })
            .populate('internalExam')
            .populate('externalExam');

        res.status(200).json({
            success: true,
            student: {
                _id: student._id,
                name: student.name,
                registration_number: student.registration_number,
                roll_number: student.roll_number
            },
            count: exams.length,
            exams
        });
    } catch (error) {
        console.error('Get Student Results Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving student results',
            error: error.message
        });
    }
};


// Get results for a specific session, with optional semester filter
exports.getSessionResults = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { semester_id } = req.query;

        // Verify session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        // Find all committees for this session
        const committees = await ExamCommittee.find({ session_id: sessionId })
            .populate('department_id', 'name');

        // Find all course assignments for these committees
        const caQuery = {
            exam_committee_id: { $in: committees.map(c => c._id) }
        };

        // Add semester filter if provided
        if (semester_id) {
            caQuery.semester_id = semester_id;
        }

        const courseAssignments = await CourseAssignment.find(caQuery)
            .populate('course_id')
            .populate('semester_id');

        // Get exam results for these course assignments
        const exams = await Exam.find({
            course_assignment_id: { $in: courseAssignments.map(ca => ca._id) },
            student_type: 'regular'
        })
            .populate('student_id', 'name registration_number roll_number department_id')
            .populate({
                path: 'course_assignment_id',
                populate: [
                    { path: 'course_id', select: 'course_code course_name credit' },
                    { path: 'semester_id', select: 'name' }
                ]
            })
            .populate('internalExam')
            .populate('externalExam');

        res.status(200).json({
            success: true,
            session: {
                _id: session._id,
                name: session.name
            },
            committees: committees.map(c => ({
                _id: c._id,
                name: c.name,
                department: c.department_id.name
            })),
            courseAssignments: courseAssignments.length,
            examsCount: exams.length,
            exams
        });
    } catch (error) {
        console.error('Get Session Results Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving session results',
            error: error.message
        });
    }
};

// Get results for a specific exam committee
exports.getCommitteeResults = async (req, res) => {
    try {
        const { committeeId } = req.params;
        const { semester_id } = req.query;

        // Verify committee exists
        const committee = await ExamCommittee.findById(committeeId)
            .populate('department_id', 'name')
            .populate('session_id', 'name')
            .populate('semesters', 'name');

        if (!committee) {
            return res.status(404).json({
                success: false,
                message: 'Exam committee not found'
            });
        }

        // Find course assignments for this committee
        const caQuery = { exam_committee_id: committeeId };

        // Add semester filter if provided
        if (semester_id) {
            caQuery.semester_id = semester_id;
        }

        const courseAssignments = await CourseAssignment.find(caQuery)
            .populate('course_id')
            .populate('semester_id');

        // Get all students in this committee's department
        const students = await Student.find({
            department_id: committee.department_id._id,
            current_session_id: committee.session_id._id
        }).select('name registration_number roll_number');

        // Get exam results
        const exams = await Exam.find({
            course_assignment_id: { $in: courseAssignments.map(ca => ca._id) },
            student_type: 'regular'
        })
            .populate('student_id', 'name registration_number roll_number')
            .populate({
                path: 'course_assignment_id',
                populate: [
                    { path: 'course_id', select: 'course_code course_name credit' },
                    { path: 'semester_id', select: 'name' }
                ]
            })
            .populate('internalExam')
            .populate('externalExam');

        res.status(200).json({
            success: true,
            committee: {
                _id: committee._id,
                name: committee.name,
                department: committee.department_id.name,
                session: committee.session_id.name,
                semesters: committee.semesters
            },
            students: students,
            courseAssignments: courseAssignments,
            examsCount: exams.length,
            exams
        });
    } catch (error) {
        console.error('Get Committee Results Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving committee results',
            error: error.message
        });
    }
};


// Get all improvement exams with corresponding original results
exports.getImprovementResults = async (req, res) => {
    try {
        const { student_id, semester_id, session_id } = req.query;

        // Build query for improvement exams
        const query = { student_type: 'improve' };
        if (student_id) query.student_id = student_id;

        // Handle semester and session filtering
        if (semester_id || session_id) {
            const caQuery = {};
            if (semester_id) caQuery.semester_id = semester_id;

            if (session_id) {
                const committeeIds = await ExamCommittee.find({ session_id }).distinct('_id');
                caQuery.exam_committee_id = { $in: committeeIds };
            }

            const caIds = await CourseAssignment.find(caQuery).distinct('_id');
            query.course_assignment_id = { $in: caIds };
        }

        // Get all improvement exams
        const improvementExams = await Exam.find(query)
            .populate('student_id', 'name registration_number roll_number')
            .populate({
                path: 'course_assignment_id',
                populate: [
                    { path: 'course_id', select: 'course_code course_name credit' },
                    { path: 'semester_id', select: 'name' },
                    {
                        path: 'exam_committee_id',
                        select: 'name session_id',
                        populate: { path: 'session_id', select: 'name' }
                    }
                ]
            })
            .populate('internalExam')
            .populate('externalExam');

        // For each improvement exam, find the original exam
        const results = await Promise.all(improvementExams.map(async (improveExam) => {
            // Find the original exam
            const originalExam = await Exam.findOne({
                student_id: improveExam.student_id._id,
                'course_assignment_id.course_id': improveExam.course_assignment_id.course_id._id,
                student_type: 'regular'
            })
                .populate('internalExam')
                .populate('externalExam');

            return {
                student: improveExam.student_id,
                course: improveExam.course_assignment_id.course_id,
                semester: improveExam.course_assignment_id.semester_id,
                session: improveExam.course_assignment_id.exam_committee_id.session_id,
                improvement_exam: improveExam,
                original_exam: originalExam || null
            };
        }));

        res.status(200).json({
            success: true,
            count: results.length,
            improvementResults: results
        });
    } catch (error) {
        console.error('Get Improvement Results Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving improvement results',
            error: error.message
        });
    }
};

// Compare original and improvement results for a specific student and course
exports.compareResults = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;

        // Find course assignments for this course
        const courseAssignments = await CourseAssignment.find({ course_id: courseId })
            .populate('course_id')
            .populate('semester_id')
            .populate({
                path: 'exam_committee_id',
                populate: { path: 'session_id' }
            });

        // Find original exam
        const originalExam = await Exam.findOne({
            student_id: studentId,
            course_assignment_id: { $in: courseAssignments.map(ca => ca._id) },
            student_type: 'regular'
        })
            .populate('student_id', 'name registration_number roll_number')
            .populate('internalExam')
            .populate('externalExam');

        // Find improvement exam
        const improvementExam = await Exam.findOne({
            student_id: studentId,
            course_assignment_id: { $in: courseAssignments.map(ca => ca._id) },
            student_type: 'improve'
        })
            .populate('internalExam')
            .populate('externalExam');

        if (!originalExam) {
            return res.status(404).json({
                success: false,
                message: 'Original exam record not found'
            });
        }

        res.status(200).json({
            success: true,
            student: originalExam.student_id,
            course: courseAssignments[0].course_id,
            semester: courseAssignments[0].semester_id,
            session: courseAssignments[0].exam_committee_id.session_id,
            original_exam: originalExam,
            improvement_exam: improvementExam || null
        });
    } catch (error) {
        console.error('Compare Results Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error comparing results',
            error: error.message
        });
    }
};

// Get complete academic record for a student
exports.getStudentAcademicRecord = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Verify student exists
        const student = await Student.findById(studentId)
            .populate('department_id', 'name')
            .populate('admission_session_id', 'name')
            .populate('current_session_id', 'name');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Get all exams for this student (regular and improvement)
        const allExams = await Exam.find({
            student_id: studentId
        })
            .populate({
                path: 'course_assignment_id',
                populate: [
                    { path: 'course_id', select: 'course_code course_name credit' },
                    { path: 'semester_id', select: 'name' },
                    {
                        path: 'exam_committee_id',
                        select: 'name session_id',
                        populate: { path: 'session_id', select: 'name' }
                    }
                ]
            })
            .populate('internalExam')
            .populate('externalExam');

        // Get all semesters the student has taken
        const semesterIds = [...new Set(
            allExams
                .filter(e => e.course_assignment_id && e.course_assignment_id.semester_id)
                .map(e => e.course_assignment_id.semester_id._id.toString())
        )];

        // Get all sessions the student has taken
        const sessionIds = [...new Set(
            allExams
                .filter(e => e.course_assignment_id && e.course_assignment_id.exam_committee_id && e.course_assignment_id.exam_committee_id.session_id)
                .map(e => e.course_assignment_id.exam_committee_id.session_id._id.toString())
        )];

        // Get all semesters for reference
        const allSemesters = await Semester.find({
            _id: { $in: semesterIds }
        }).sort({ name: 1 });

        // Get all sessions for reference
        const allSessions = await Session.find({
            _id: { $in: sessionIds }
        }).sort({ name: 1 });

        res.status(200).json({
            success: true,
            student: {
                _id: student._id,
                name: student.name,
                registration_number: student.registration_number,
                roll_number: student.roll_number,
                department: student.department_id,
                admission_session: student.admission_session_id,
                current_session: student.current_session_id
            },
            semesters: allSemesters,
            sessions: allSessions,
            exams: allExams
        });
    } catch (error) {
        console.error('Get Academic Record Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving academic record',
            error: error.message
        });
    }
};


// Get student detailed results with various filtering options
exports.getStudentDetailedResults = async (req, res) => {
    try {
        // Extract query parameters
        const { studentId, semesterId, sessionId, committeeId, includeUnapproved } = req.query;

        // Validate that studentId is provided
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required'
            });
        }

        // Find student details
        const student = await Student.findById(studentId)
            .populate('department_id')
            .populate('current_session_id');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Build base query for finding course assignments
        let committeeQuery = {};
        if (sessionId) committeeQuery.session_id = sessionId;
        if (committeeId) committeeQuery._id = committeeId;
        let committeeIds = [];
        if (Object.keys(committeeQuery).length > 0) {
            const committees = await ExamCommittee.find(committeeQuery).select('_id');
            committeeIds = committees.map(committee => committee._id);
        }

        // Find course assignments based on criteria
        let courseAssignmentQuery = {};
        if (committeeIds && committeeIds.length > 0) {
            courseAssignmentQuery.exam_committee_id = { $in: committeeIds };
        }
        if (semesterId) courseAssignmentQuery.semester_id = semesterId;

        const courseAssignments = await CourseAssignment.find(courseAssignmentQuery)
            .populate({
                path: 'exam_committee_id',
                select: 'name session_id department_id',
                populate: [
                    { path: 'session_id', select: 'name' },
                    { path: 'department_id', select: 'name' }
                ]
            })
            .populate('semester_id', 'name')
            .populate('course_id', 'code name credit_hours');

        // Get all exams for the student across these course assignments
        const assignmentIds = courseAssignments.map(ca => ca._id);
        const exams = await Exam.find({
            student_id: studentId,
            course_assignment_id: { $in: assignmentIds }
        }).lean();

        // Get all internal and external exam data
        const examIds = exams.map(exam => exam._id);
        const internalExams = await InternalExam.find({ exam_id: { $in: examIds } }).lean();
        const externalExams = await ExternalExam.find({ exam_id: { $in: examIds } }).lean();

        // Fetch all approval statuses for relevant committees and semesters
        const uniqueCommitteeSemesterPairs = [];
        courseAssignments.forEach(ca => {
            if (ca.exam_committee_id && ca.semester_id) {
                const pair = {
                    committeeId: ca.exam_committee_id._id.toString(),
                    semesterId: ca.semester_id._id.toString()
                };
                if (!uniqueCommitteeSemesterPairs.some(p =>
                    p.committeeId === pair.committeeId && p.semesterId === pair.semesterId)) {
                    uniqueCommitteeSemesterPairs.push(pair);
                }
            }
        });

        const approvalStatuses = await ApprovalStatus.find({
            $or: uniqueCommitteeSemesterPairs.map(pair => ({
                exam_committee_id: pair.committeeId,
                semester_id: pair.semesterId
            }))
        }).lean();

        // Create map for easy lookup
        const approvalStatusMap = approvalStatuses.reduce((map, item) => {
            const key = `${item.exam_committee_id.toString()}_${item.semester_id.toString()}`;
            map[key] = item;
            return map;
        }, {});

        const internalExamsMap = internalExams.reduce((map, item) => {
            map[item.exam_id.toString()] = item;
            return map;
        }, {});

        const externalExamsMap = externalExams.reduce((map, item) => {
            map[item.exam_id.toString()] = item;
            return map;
        }, {});

        const courseAssignmentsMap = courseAssignments.reduce((map, item) => {
            map[item._id.toString()] = item;
            return map;
        }, {});

        // Process results for each exam
        const results = [];
        let totalGradePoints = 0;
        let totalCredits = 0;

        for (const exam of exams) {
            const courseAssignment = courseAssignmentsMap[exam.course_assignment_id.toString()];
            if (!courseAssignment) continue;

            // Check if marks are approved
            const approvalKey = `${courseAssignment.exam_committee_id._id.toString()}_${courseAssignment.semester_id._id.toString()}`;
            const approvalStatus = approvalStatusMap[approvalKey] || {
                internal_mark_status: 'pending',
                external_mark_status: 'pending'
            };

            const internalExam = internalExamsMap[exam._id.toString()] || {};
            const externalExam = externalExamsMap[exam._id.toString()] || {};

            // Only include approved marks unless includeUnapproved is set to true
            const isInternalApproved = approvalStatus.internal_mark_status === 'approved';
            const isExternalApproved = approvalStatus.external_mark_status === 'approved';
            const includeInternal = isInternalApproved || includeUnapproved === 'true';
            const includeExternal = isExternalApproved || includeUnapproved === 'true';

            // Calculate internal marks
            const internalMarks = includeInternal ? (
                (internalExam.first_exam_mark || 0) +
                (internalExam.second_exam_mark || 0) +
                (internalExam.third_exam_mark || 0) +
                (internalExam.attendance_mark || 0)
            ) : 0;

            // Calculate external marks
            let externalMarks = 0;
            if (includeExternal) {
                if (externalExam.first_examiner_mark !== null && externalExam.second_examiner_mark !== null) {
                    const firstMark = externalExam.first_examiner_mark || 0;
                    const secondMark = externalExam.second_examiner_mark || 0;

                    // If third examiner exists and is required
                    if (externalExam.is_third_examiner_required && externalExam.third_examiner_mark !== null) {
                        const thirdMark = externalExam.third_examiner_mark || 0;

                        // Calculate differences between all pairs
                        const diff12 = Math.abs(firstMark - secondMark);
                        const diff13 = Math.abs(firstMark - thirdMark);
                        const diff23 = Math.abs(secondMark - thirdMark);

                        // Find which two examiners have the closest marks
                        if (diff12 <= diff13 && diff12 <= diff23) {
                            // First and second are closest
                            externalMarks = (firstMark + secondMark) / 2;
                        } else if (diff13 <= diff12 && diff13 <= diff23) {
                            // First and third are closest
                            externalMarks = (firstMark + thirdMark) / 2;
                        } else {
                            // Second and third are closest
                            externalMarks = (secondMark + thirdMark) / 2;
                        }
                    } else {
                        // No third examiner or not required, use average of first two
                        externalMarks = (firstMark + secondMark) / 2;
                    }
                } else if (externalExam.first_examiner_mark !== null) {
                    // Only first examiner mark exists
                    externalMarks = externalExam.first_examiner_mark || 0;
                } else if (externalExam.second_examiner_mark !== null) {
                    // Only second examiner mark exists
                    externalMarks = externalExam.second_examiner_mark || 0;
                } else if (externalExam.third_examiner_mark !== null) {
                    // Only third examiner mark exists
                    externalMarks = externalExam.third_examiner_mark || 0;
                }
            }

            // Calculate total marks and grade
            const totalMarks = internalMarks + externalMarks;
            const letterGrade = calculateGrade(totalMarks);
            const gradePoint = getGradePoint(letterGrade);
            const creditHours = courseAssignment.course_id.credit_hours || 0;
            const gradePointEarned = gradePoint * creditHours;

            // Only include in GPA calculation if both internal and external marks are approved
            if ((isInternalApproved && isExternalApproved) || includeUnapproved === 'true') {
                totalGradePoints += gradePointEarned;
                totalCredits += creditHours;
            }

            results.push({
                course: {
                    id: courseAssignment.course_id._id,
                    code: courseAssignment.course_id.code,
                    name: courseAssignment.course_id.name,
                    credit_hours: creditHours
                },
                committee: courseAssignment.exam_committee_id.name,
                session: courseAssignment.exam_committee_id.session_id?.name,
                semester: courseAssignment.semester_id?.name,
                marks: {
                    internal: internalMarks,
                    external: externalMarks,
                    total: totalMarks
                },
                approvalStatus: {
                    internal: approvalStatus.internal_mark_status,
                    external: approvalStatus.external_mark_status,
                    isFullyApproved: isInternalApproved && isExternalApproved
                },
                letterGrade,
                gradePoint,
                gradePointEarned,
                examStatus: exam.status,
                includedInGPA: (isInternalApproved && isExternalApproved) || includeUnapproved === 'true'
            });
        }

        // Calculate GPA
        const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

        // Format response
        const response = {
            studentDetails: {
                id: student._id,
                name: student.name,
                registrationNumber: student.registration_number,
                rollNumber: student.roll_number,
                department: student.department_id?.name,
                session: student.current_session_id?.name
            },
            exams: results,
            summary: {
                totalCourses: results.length,
                approvedCourses: results.filter(r => r.approvalStatus.isFullyApproved).length,
                totalCredits,
                totalGradePoints,
                gpa,
                includesUnapprovedMarks: includeUnapproved === 'true'
            }
        };

        return res.status(200).json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error('Error fetching student detailed results:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function to convert letter grade to grade point
function getGradePoint(letterGrade) {
    switch (letterGrade) {
        case 'A+': return 4.00;
        case 'A': return 3.75;
        case 'A-': return 3.50;
        case 'B+': return 3.25;
        case 'B': return 3.00;
        case 'B-': return 2.75;
        case 'C+': return 2.50;
        case 'C': return 2.25;
        case 'D': return 2.00;
        default: return 0.00; // F
    }
}


// Get student transcript data for PDF generation
exports.getStudentTranscript = async (req, res) => {
    try {
        const { committeeId, semesterId, studentId } = req.query;
        console.log(`Generating transcript for student ${studentId} in committee ${committeeId}, semester ${semesterId}`);

        if (!committeeId || !semesterId || !studentId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }

        // Get data with full population
        const committee = await ExamCommittee.findById(committeeId)
            .populate('department_id', 'name')
            .populate('session_id', 'name');

        const semester = await Semester.findById(semesterId);
        const student = await Student.findById(studentId)
            .populate('department_id', 'name')
            .populate('current_session_id', 'name');

        if (!committee || !semester || !student) {
            return res.status(404).json({
                success: false,
                message: 'Required data not found',
                details: {
                    committeeFound: !!committee,
                    semesterFound: !!semester,
                    studentFound: !!student
                }
            });
        }

        // Get all course assignments for this committee and semester
        const courseAssignments = await CourseAssignment.find({
            exam_committee_id: committeeId,
            semester_id: semesterId
        }).populate('course_id');

        console.log(`Found ${courseAssignments.length} course assignments`);

        // Get all exams for these assignments for this student
        const results = [];

        for (const assignment of courseAssignments) {
            const exam = await Exam.findOne({
                course_assignment_id: assignment._id,
                student_id: studentId
            });

            if (exam) {
                // Fetch marks
                const internalMarks = await InternalExam.findOne({ exam_id: exam._id });
                const externalMarks = await ExternalExam.findOne({ exam_id: exam._id });

                console.log(`Found marks for course ${assignment.course_id.course_code}:`,
                    { internal: internalMarks, external: externalMarks });

                results.push({
                    course: {
                        _id: assignment.course_id._id,
                        course_code: assignment.course_id.course_code,
                        course_name: assignment.course_id.course_name,
                        credit: assignment.course_id.credit
                    },
                    marks: {
                        internal: internalMarks ? {
                            first_exam: internalMarks.first_exam_mark || 0,
                            second_exam: internalMarks.second_exam_mark || 0,
                            third_exam: internalMarks.third_exam_mark || 0,
                            attendance: internalMarks.attendance_mark || 0,
                            total: (internalMarks.first_exam_mark || 0) +
                                (internalMarks.second_exam_mark || 0) +
                                (internalMarks.third_exam_mark || 0) +
                                (internalMarks.attendance_mark || 0)
                        } : null,
                        external: externalMarks ? {
                            first_examiner: externalMarks.first_examiner_mark || 0,
                            second_examiner: externalMarks.second_examiner_mark || 0,
                            third_examiner: externalMarks.third_examiner_mark || 0,
                            final: calculateFinalMark(externalMarks)
                        } : null
                    },
                    status: exam.status,
                    grade: calculateGrade(internalMarks, externalMarks)
                });
            }
        }

        console.log(`Found ${results.length} course results`);

        // Return complete transcript data
        return res.status(200).json({
            success: true,
            committee: {
                name: committee.name,
                department: committee.department_id?.name || '',
                session: committee.session_id?.name || ''
            },
            semester: {
                name: semester.name
            },
            student: {
                name: student.name,
                roll_number: student.roll_number,
                registration_number: student.registration_number,
                department: student.department_id?.name || '',
                session: student.current_session_id?.name || ''
            },
            results: results
        });
    } catch (error) {
        console.error('Error generating transcript:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Helper function to calculate final mark
function calculateFinalMark(externalMarks) {
    if (!externalMarks) return 0;

    if (externalMarks.first_examiner_mark && externalMarks.second_examiner_mark) {
        if (externalMarks.third_examiner_mark && externalMarks.is_third_examiner_required) {
            // Find closest two marks if third examiner was used
            const marks = [
                externalMarks.first_examiner_mark,
                externalMarks.second_examiner_mark,
                externalMarks.third_examiner_mark
            ];
            marks.sort((a, b) => a - b);

            // Find which pair has smallest difference
            const diff12 = Math.abs(marks[0] - marks[1]);
            const diff23 = Math.abs(marks[1] - marks[2]);

            if (diff12 <= diff23) {
                return (marks[0] + marks[1]) / 2;
            } else {
                return (marks[1] + marks[2]) / 2;
            }
        }

        // Average of first and second examiner
        return (externalMarks.first_examiner_mark + externalMarks.second_examiner_mark) / 2;
    }

    return 0;
}

// Add this new controller method
exports.getStudentsForTranscript = async (req, res) => {
    try {
        const { committee, semester } = req.query;

        if (!committee || !semester) {
            return res.status(400).json({
                success: false,
                message: 'Committee and semester IDs are required'
            });
        }

        console.log(`Finding students for committee: ${committee}, semester: ${semester}`);

        // Find all course assignments for this committee and semester
        const courseAssignments = await CourseAssignment.find({
            exam_committee_id: committee,
            semester_id: semester
        });

        if (!courseAssignments || courseAssignments.length === 0) {
            console.log('No course assignments found');
            return res.status(200).json({
                success: true,
                students: []
            });
        }

        console.log(`Found ${courseAssignments.length} course assignments`);

        // Get assignment IDs
        const assignmentIds = courseAssignments.map(ca => ca._id);

        // Find all exams for these assignments
        const exams = await Exam.find({
            course_assignment_id: { $in: assignmentIds }
        }).populate('student_id', 'name roll_number registration_number');

        console.log(`Found ${exams.length} exams`);

        // Extract unique students
        const uniqueStudents = [];
        const studentIds = new Set();

        exams.forEach(exam => {
            if (exam.student_id && !studentIds.has(exam.student_id._id.toString())) {
                studentIds.add(exam.student_id._id.toString());
                uniqueStudents.push({
                    _id: exam.student_id._id,
                    name: exam.student_id.name,
                    roll_number: exam.student_id.roll_number,
                    registration_number: exam.student_id.registration_number
                });
            }
        });

        console.log(`Found ${uniqueStudents.length} unique students`);

        return res.status(200).json({
            success: true,
            students: uniqueStudents
        });
    } catch (error) {
        console.error('Error fetching students for transcript:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};