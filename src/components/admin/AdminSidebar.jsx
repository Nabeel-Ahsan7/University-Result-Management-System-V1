import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Building2,
    Calendar,
    BookOpen,
    Users,
    UserCog,
    UserPlus,
    ClipboardList,
    GraduationCap,
    FileSpreadsheet,
    Home,
    ChevronDown,
    ChevronRight,
    ClipboardCheck, // Add this new import
    CheckSquare, // Add this new import
    FileText  // Add this for the transcript icon
} from 'lucide-react';

export default function AdminSidebar() {
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({
        academic: true,
        users: true,
        examination: true,
    });

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const menuItemClass = (path) => {
        return `group flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-colors ${isActive(path)
            ? 'bg-white'
            : 'hover:bg-white'
            }`;
    };

    const menuSectionClass = (isOpen) => {
        return `group flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-white rounded-lg cursor-pointer ${isOpen ? 'mb-1' : ''}`;
    };

    return (
        <aside className="w-64 bg-[#025c53] overflow-y-auto h-full">
            <div className="flex items-center justify-center h-16 border-b border-teal-700">
                <span className="text-xl font-bold text-white">Admin Panel</span>
            </div>

            <nav className="px-2 py-4">
                <Link to="/admin" className={menuItemClass('/admin')}>
                    <Home size={20} className={`${isActive('/admin') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                    <span className={`${isActive('/admin') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Dashboard</span>
                </Link>

                {/* Academic Section */}
                <div className="mt-6">
                    <div
                        className={menuSectionClass(openMenus.academic)}
                        onClick={() => toggleMenu('academic')}
                    >
                        <span className="text-white group-hover:text-[#025c53]">Academic Setup</span>
                        {openMenus.academic ?
                            <ChevronDown size={16} className="text-white group-hover:text-[#025c53]" /> :
                            <ChevronRight size={16} className="text-white group-hover:text-[#025c53]" />
                        }
                    </div>

                    {openMenus.academic && (
                        <div className="space-y-1 pl-2">
                            <Link to="/admin/faculties" className={menuItemClass('/admin/faculties')}>
                                <Building2 size={20} className={`${isActive('/admin/faculties') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/faculties') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Faculties</span>
                            </Link>

                            <Link to="/admin/departments" className={menuItemClass('/admin/departments')}>
                                <Building2 size={20} className={`${isActive('/admin/departments') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/departments') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Departments</span>
                            </Link>

                            <Link to="/admin/sessions" className={menuItemClass('/admin/sessions')}>
                                <Calendar size={20} className={`${isActive('/admin/sessions') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/sessions') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Sessions</span>
                            </Link>

                            <Link to="/admin/semesters" className={menuItemClass('/admin/semesters')}>
                                <BookOpen size={20} className={`${isActive('/admin/semesters') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/semesters') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Semesters</span>
                            </Link>

                            <Link to="/admin/courses" className={menuItemClass('/admin/courses')}>
                                <BookOpen size={20} className={`${isActive('/admin/courses') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/courses') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Courses</span>
                            </Link>

                        </div>
                    )}
                </div>

                {/* Users Section */}
                <div className="mt-4">
                    <div
                        className={menuSectionClass(openMenus.users)}
                        onClick={() => toggleMenu('users')}
                    >
                        <span className="text-white group-hover:text-[#025c53]">User Management</span>
                        {openMenus.users ?
                            <ChevronDown size={16} className="text-white group-hover:text-[#025c53]" /> :
                            <ChevronRight size={16} className="text-white group-hover:text-[#025c53]" />
                        }
                    </div>

                    {openMenus.users && (
                        <div className="space-y-1 pl-2">
                            <Link to="/admin/students" className={menuItemClass('/admin/students')}>
                                <Users size={20} className={`${isActive('/admin/students') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/students') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Students</span>
                            </Link>

                            <Link to="/admin/teachers" className={menuItemClass('/admin/teachers')}>
                                <UserCog size={20} className={`${isActive('/admin/teachers') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/teachers') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Teachers</span>
                            </Link>

                            <Link to="/admin/external-teachers" className={menuItemClass('/admin/external-teachers')}>
                                <UserPlus size={20} className={`${isActive('/admin/external-teachers') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/external-teachers') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>External Teachers</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Examination Section */}
                <div className="mt-4">
                    <div
                        className={menuSectionClass(openMenus.examination)}
                        onClick={() => toggleMenu('examination')}
                    >
                        <span className="text-white group-hover:text-[#025c53]">Examination</span>
                        {openMenus.examination ?
                            <ChevronDown size={16} className="text-white group-hover:text-[#025c53]" /> :
                            <ChevronRight size={16} className="text-white group-hover:text-[#025c53]" />
                        }
                    </div>

                    {openMenus.examination && (
                        <div className="space-y-1 pl-2">
                            <Link to="/admin/exam-committees" className={menuItemClass('/admin/exam-committees')}>
                                <ClipboardList size={20} className={`${isActive('/admin/exam-committees') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/exam-committees') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Exam Committees</span>
                            </Link>

                            <Link to="/admin/course-assignments" className={menuItemClass('/admin/course-assignments')}>
                                <GraduationCap size={20} className={`${isActive('/admin/course-assignments') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/course-assignments') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Course Assignments</span>
                            </Link>

                            {/* Add the new Monitor Exam option here */}
                            <Link to="/admin/monitor-exams" className={menuItemClass('/admin/monitor-exams')}>
                                <ClipboardCheck size={20} className={`${isActive('/admin/monitor-exams') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/monitor-exams') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Monitor Exam</span>
                            </Link>

                            {/* Add the new Approval Status option here */}
                            <Link to="/admin/approval-status" className={menuItemClass('/admin/approval-status')}>
                                <CheckSquare size={20} className={`${isActive('/admin/approval-status') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/approval-status') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Approval Status</span>
                            </Link>

                            <Link to="/admin/improvement-exams" className={menuItemClass('/admin/improvement-exams')}>
                                <GraduationCap size={20} className={`${isActive('/admin/improvement-exams') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/improvement-exams') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Improvement Exams</span>
                            </Link>

                            <Link to="/admin/results" className={menuItemClass('/admin/results')}>
                                <FileSpreadsheet size={20} className={`${isActive('/admin/results') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/results') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Results</span>
                            </Link>

                            {/* Add the new Transcripts option here */}
                            <Link to="/admin/transcripts" className={menuItemClass('/admin/transcripts')}>
                                <FileText size={20} className={`${isActive('/admin/transcripts') ? 'text-[#025c53]' : 'text-white group-hover:text-[#025c53]'}`} />
                                <span className={`${isActive('/admin/transcripts') ? 'text-[#025c53] font-medium' : 'text-white group-hover:text-[#025c53]'}`}>Transcripts</span>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
}