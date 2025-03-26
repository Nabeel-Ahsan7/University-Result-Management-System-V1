import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminHeader() {
    const navigate = useNavigate();
    const { admin, logout } = useAuth();
    const adminName = admin?.name || 'Admin';

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ color: "#025c53" }}>Result Management System</h1>

            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                    >
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
                            <User size={16} />
                        </div>
                        <span className="font-medium text-gray-700">{adminName}</span>
                    </button>

                    {isOpen && (
                        <div
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLogout();
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}