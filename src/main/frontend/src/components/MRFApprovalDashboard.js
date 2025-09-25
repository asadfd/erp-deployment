import React, { useState, useEffect } from 'react';

const MRFApprovalDashboard = ({ onBack }) => {
    const [pendingMRFs, setPendingMRFs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedMRF, setSelectedMRF] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [expandedMRF, setExpandedMRF] = useState(null);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        fetchPendingMRFs();
        checkUserRole();
    }, []);

    const checkUserRole = async () => {
        try {
            const response = await fetch('/api/auth/status', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                const roles = data.authorities || [];
                if (roles.some(role => role.authority === 'ROLE_SUPER_ADMIN')) {
                    setUserRole('SUPERADMIN');
                } else if (roles.some(role => role.authority === 'ROLE_ADMIN')) {
                    setUserRole('ADMIN');
                } else {
                    setUserRole('');
                }
            }
        } catch (err) {
            console.error('Error checking user role:', err);
        }
    };

    const fetchPendingMRFs = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/mrf/pending', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPendingMRFs(data);
                setError('');
            } else {
                setError('Failed to fetch pending MRFs');
            }
        } catch (err) {
            setError('Failed to fetch pending MRFs');
            console.error('Error fetching pending MRFs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (mrfId) => {
        if (window.confirm('Are you sure you want to approve this MRF?')) {
            try {
                const response = await fetch(`/api/mrf/${mrfId}/approve`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('MRF approved successfully');
                    fetchPendingMRFs();
                } else {
                    const errorText = await response.text();
                    alert('Failed to approve MRF: ' + errorText);
                }
            } catch (err) {
                alert('Failed to approve MRF: ' + err.message);
            }
        }
    };

    const handleRejectClick = (mrf) => {
        setSelectedMRF(mrf);
        setShowRejectModal(true);
        setRejectionReason('');
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            const response = await fetch(`/api/mrf/${selectedMRF.id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(rejectionReason)
            });

            if (response.ok) {
                alert('MRF rejected successfully');
                setShowRejectModal(false);
                fetchPendingMRFs();
            } else {
                const errorText = await response.text();
                alert('Failed to reject MRF: ' + errorText);
            }
        } catch (err) {
            alert('Failed to reject MRF: ' + err.message);
        }
    };

    const handleToggleExpand = (mrfId) => {
        setExpandedMRF(expandedMRF === mrfId ? null : mrfId);
    };

    const canApprove = (mrf) => {
        if (userRole === 'SUPERADMIN') {
            return true; // SuperAdmin can approve all
        }
        if (userRole === 'ADMIN') {
            return !mrf.requiresSuperadmin; // Admin can only approve < 2000 AED
        }
        return false;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const getApprovalLevelColor = (requiresSuperadmin) => {
        return requiresSuperadmin ? '#dc3545' : '#28a745';
    };

    // Styles
    const containerStyle = {
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
    };

    const titleStyle = {
        marginBottom: '30px',
        color: '#333',
        textAlign: 'center'
    };

    const headerControlsStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    };

    const summaryStyle = {
        fontSize: '16px',
        color: '#495057',
        fontWeight: 'bold'
    };

    const backButtonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        backgroundColor: '#6c757d',
        color: 'white'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden'
    };

    const headerStyle = {
        backgroundColor: '#007bff',
        color: 'white'
    };

    const cellStyle = {
        padding: '12px',
        textAlign: 'left',
        borderBottom: '1px solid #ddd'
    };

    const approvalLevelCellStyle = (requiresSuperadmin) => ({
        ...cellStyle,
        fontWeight: 'bold',
        color: getApprovalLevelColor(requiresSuperadmin)
    });

    const actionButtonStyle = {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '3px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginRight: '5px'
    };

    const viewButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#17a2b8',
        color: 'white'
    };

    const approveButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#28a745',
        color: 'white'
    };

    const rejectButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#dc3545',
        color: 'white'
    };

    const disabledButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#6c757d',
        color: 'white',
        cursor: 'not-allowed'
    };

    const expandedRowStyle = {
        backgroundColor: '#f8f9fa'
    };

    const itemsTableStyle = {
        width: '100%',
        marginTop: '10px',
        fontSize: '14px',
        border: '1px solid #dee2e6'
    };

    const itemsHeaderStyle = {
        backgroundColor: '#e9ecef',
        fontWeight: 'bold'
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    };

    const modalContentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    const modalTitleStyle = {
        marginBottom: '20px',
        color: '#333',
        fontSize: '20px'
    };

    const textareaStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        minHeight: '100px',
        resize: 'vertical',
        boxSizing: 'border-box',
        marginBottom: '20px'
    };

    const modalActionsStyle = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    };

    const modalButtonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer'
    };

    const cancelButtonStyle = {
        ...modalButtonStyle,
        backgroundColor: '#6c757d',
        color: 'white'
    };

    const submitButtonStyle = {
        ...modalButtonStyle,
        backgroundColor: '#dc3545',
        color: 'white'
    };

    const loadingStyle = {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px',
        color: '#666'
    };

    const errorStyle = {
        textAlign: 'center',
        padding: '50px',
        fontSize: '16px',
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        borderRadius: '4px',
        border: '1px solid #dc3545'
    };

    const noDataStyle = {
        textAlign: 'center',
        padding: '50px',
        fontSize: '16px',
        color: '#666',
        fontStyle: 'italic'
    };

    const permissionNoticeStyle = {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        border: '1px solid #bee5eb'
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={loadingStyle}>Loading pending MRFs...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={errorStyle}>{error}</div>
                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <button onClick={onBack} style={backButtonStyle}>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>MRF Approval Dashboard</h2>

            {userRole && (
                <div style={permissionNoticeStyle}>
                    <strong>Your Role: {userRole}</strong>
                    <br />
                    {userRole === 'SUPERADMIN' && 'You can approve all MRFs regardless of amount.'}
                    {userRole === 'ADMIN' && 'You can approve MRFs under 2,000 AED. MRFs above this amount require SuperAdmin approval.'}
                </div>
            )}

            <div style={headerControlsStyle}>
                <div style={summaryStyle}>
                    Pending MRFs: {pendingMRFs.length}
                    {userRole === 'ADMIN' && (
                        <span style={{color: '#28a745', marginLeft: '20px'}}>
                            Your Approval Queue: {pendingMRFs.filter(mrf => !mrf.requiresSuperadmin).length}
                        </span>
                    )}
                </div>
                <button onClick={onBack} style={backButtonStyle}>
                    Back to Dashboard
                </button>
            </div>

            {pendingMRFs.length === 0 ? (
                <div style={noDataStyle}>
                    No pending MRFs for approval
                </div>
            ) : (
                <table style={tableStyle}>
                    <thead style={headerStyle}>
                        <tr>
                            <th style={cellStyle}>MRF Number</th>
                            <th style={cellStyle}>Requestor</th>
                            <th style={cellStyle}>Department</th>
                            <th style={cellStyle}>Total Amount</th>
                            <th style={cellStyle}>Approval Level</th>
                            <th style={cellStyle}>Items Count</th>
                            <th style={cellStyle}>Created Date</th>
                            <th style={cellStyle}>Requested By</th>
                            <th style={cellStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingMRFs.map((mrf) => (
                            <React.Fragment key={mrf.id}>
                                <tr>
                                    <td style={cellStyle}>{mrf.mrfNumber}</td>
                                    <td style={cellStyle}>{mrf.requestorName}</td>
                                    <td style={cellStyle}>{mrf.requestorDepartment || 'N/A'}</td>
                                    <td style={cellStyle}>{mrf.totalAmount?.toFixed(2)} AED</td>
                                    <td style={approvalLevelCellStyle(mrf.requiresSuperadmin)}>
                                        {mrf.requiresSuperadmin ? 'SuperAdmin Required' : 'Admin Level'}
                                    </td>
                                    <td style={cellStyle}>{mrf.items?.length || 0}</td>
                                    <td style={cellStyle}>{formatDateTime(mrf.creationDate)}</td>
                                    <td style={cellStyle}>{mrf.requestedBy}</td>
                                    <td style={cellStyle}>
                                        <button
                                            onClick={() => handleToggleExpand(mrf.id)}
                                            style={viewButtonStyle}
                                        >
                                            {expandedMRF === mrf.id ? 'Hide' : 'View'} Details
                                        </button>
                                        
                                        {canApprove(mrf) ? (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(mrf.id)}
                                                    style={approveButtonStyle}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectClick(mrf)}
                                                    style={rejectButtonStyle}
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                disabled
                                                style={disabledButtonStyle}
                                                title={`This MRF requires ${mrf.requiresSuperadmin ? 'SuperAdmin' : 'Admin'} approval`}
                                            >
                                                No Permission
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                
                                {expandedMRF === mrf.id && (
                                    <tr style={expandedRowStyle}>
                                        <td colSpan="9" style={{...cellStyle, padding: '20px'}}>
                                            <div style={{marginBottom: '15px'}}>
                                                <strong>Employee ID:</strong> {mrf.requestorEmployeeId || 'N/A'}
                                            </div>
                                            
                                            <div style={{marginBottom: '15px'}}>
                                                <strong>Reason/Justification:</strong>
                                                <div style={{marginTop: '5px', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dee2e6'}}>
                                                    {mrf.reasonJustification}
                                                </div>
                                            </div>
                                            
                                            <strong>Requested Items:</strong>
                                            <table style={itemsTableStyle}>
                                                <thead style={itemsHeaderStyle}>
                                                    <tr>
                                                        <th style={{...cellStyle, padding: '8px'}}>Description</th>
                                                        <th style={{...cellStyle, padding: '8px'}}>Quantity</th>
                                                        <th style={{...cellStyle, padding: '8px'}}>Unit Price</th>
                                                        <th style={{...cellStyle, padding: '8px'}}>Amount</th>
                                                        <th style={{...cellStyle, padding: '8px'}}>Specifications</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mrf.items && mrf.items.map((item, index) => (
                                                        <tr key={index}>
                                                            <td style={{...cellStyle, padding: '8px'}}>{item.itemDescription}</td>
                                                            <td style={{...cellStyle, padding: '8px'}}>{item.quantity}</td>
                                                            <td style={{...cellStyle, padding: '8px'}}>{item.unitPrice?.toFixed(2)} AED</td>
                                                            <td style={{...cellStyle, padding: '8px'}}>{item.amount?.toFixed(2)} AED</td>
                                                            <td style={{...cellStyle, padding: '8px'}}>{item.specifications || 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            )}

            {showRejectModal && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={modalTitleStyle}>Reject MRF: {selectedMRF?.mrfNumber}</h3>
                        <p><strong>Requestor:</strong> {selectedMRF?.requestorName}</p>
                        <p><strong>Total Amount:</strong> {selectedMRF?.totalAmount?.toFixed(2)} AED</p>
                        
                        <textarea
                            placeholder="Enter rejection reason..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            style={textareaStyle}
                        />
                        
                        <div style={modalActionsStyle}>
                            <button 
                                style={cancelButtonStyle} 
                                onClick={() => setShowRejectModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                style={submitButtonStyle} 
                                onClick={handleReject}
                            >
                                Reject MRF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MRFApprovalDashboard;