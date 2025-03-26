import React from 'react';
import ApprovalStatusMonitor from '../../components/admin/examination/ApprovalStatusMonitor';

const ApprovalStatusPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Approval Status Monitor</h1>
            <p className="mb-6 text-gray-600">
                Track and monitor the approval status of internal and external marks for each committee and semester.
            </p>

            <ApprovalStatusMonitor />
        </div>
    );
};

export default ApprovalStatusPage;