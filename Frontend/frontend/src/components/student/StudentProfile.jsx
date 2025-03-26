import React from 'react';

const StudentProfile = ({ student }) => {
    if (!student) return null;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "#025c53" }}>
                Student Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="mt-1">{student?.name}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Registration Number</p>
                    <p className="mt-1">{student?.registration_number}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Roll Number</p>
                    <p className="mt-1">{student?.roll_number}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p className="mt-1">{student?.department_id?.name}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Current Session</p>
                    <p className="mt-1">{student?.current_session_id?.name}</p>
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Admission Session</p>
                    <p className="mt-1">{student?.admission_session_id?.name}</p>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;