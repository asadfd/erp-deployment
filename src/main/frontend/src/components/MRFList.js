import React, { useState, useEffect } from 'react';

const MRFList = ({ onBack, onEdit, onViewDetails }) => {
    const [mrfList, setMrfList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState('view');
    const [expandedMRF, setExpandedMRF] = useState(null);

    useEffect(() => {
        fetchMRFs();
    }, []);

    const fetchMRFs = async () => {
        try {
            const response = await fetch('/api/mrf/my', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setMrfList(data);
            } else {
                alert('Failed to fetch MRFs');
            }
        } catch (error) {
            console.error('Error fetching MRFs:', error);
            alert('Error fetching MRFs');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (mrf) => {
        if (mrf.status === 'PENDING') {
            onEdit(mrf);
        } else {
            alert('Only pending MRFs can be edited');
        }
    };

    const handleDelete = async (mrf) => {
        if (mrf.status !== 'PENDING') {
            alert('Only pending MRFs can be deleted');
            return;
        }

        if (window.confirm(`Are you sure you want to delete MRF "${mrf.mrfNumber}"?`)) {
            try {
                const response = await fetch(`/api/mrf/${mrf.id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('MRF deleted successfully!');
                    fetchMRFs(); // Refresh the list
                } else {
                    alert('Failed to delete MRF');
                }
            } catch (error) {
                console.error('Error deleting MRF:', error);
                alert('Error deleting MRF');
            }
        }
    };

    const handleToggleExpand = (mrfId) => {
        setExpandedMRF(expandedMRF === mrfId ? null : mrfId);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return '#ffc107';
            case 'APPROVED':
                return '#28a745';
            case 'REJECTED':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const getApproverType = (requiresSuperadmin) => {
        return requiresSuperadmin ? 'SuperAdmin' : 'Admin';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    // Styles
    const containerStyle = {
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
    };

    const titleStyle = {
        marginBottom: '20px',
        color: '#333',
        textAlign: 'center'
    };

    const controlsStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
    };

    const actionSelectorStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const selectStyle = {
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
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

    const statusCellStyle = (status) => ({
        ...cellStyle,
        fontWeight: 'bold',
        color: getStatusColor(status)
    });

    const actionButtonStyle = {
        padding: '5px 10px',
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

    const editButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#28a745',
        color: 'white'
    };

    const deleteButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#dc3545',
        color: 'white'
    };

    const expandButtonStyle = {
        ...actionButtonStyle,
        backgroundColor: '#6c757d',
        color: 'white'
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

    const loadingStyle = {
        textAlign: 'center',
        padding: '50px',
        fontSize: '18px',
        color: '#666'
    };

    const noDataStyle = {
        textAlign: 'center',
        padding: '50px',
        fontSize: '16px',
        color: '#666',
        fontStyle: 'italic'
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={loadingStyle}>Loading MRFs...</div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>Material Request Forms</h2>
            
            <div style={controlsStyle}>
                <div style={actionSelectorStyle}>
                    <label>Action Mode:</label>
                    <select 
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="view">View Only</option>
                        <option value="edit">Edit Mode</option>
                        <option value="delete">Delete Mode</option>
                    </select>
                </div>
                
                <button
                    onClick={onBack}
                    style={backButtonStyle}
                >
                    Back to Main
                </button>
            </div>

            {mrfList.length === 0 ? (
                <div style={noDataStyle}>
                    No MRFs found. Create your first Material Request Form!
                </div>
            ) : (
                <table style={tableStyle}>
                    <thead style={headerStyle}>
                        <tr>
                            <th style={cellStyle}>MRF Number</th>
                            <th style={cellStyle}>Requestor</th>
                            <th style={cellStyle}>Department</th>
                            <th style={cellStyle}>Total Amount</th>
                            <th style={cellStyle}>Status</th>
                            <th style={cellStyle}>Approver Type</th>
                            <th style={cellStyle}>Created Date</th>
                            <th style={cellStyle}>Approval Date</th>
                            <th style={cellStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mrfList.map((mrf) => (
                            <React.Fragment key={mrf.id}>
                                <tr>
                                    <td style={cellStyle}>{mrf.mrfNumber}</td>
                                    <td style={cellStyle}>{mrf.requestorName}</td>
                                    <td style={cellStyle}>{mrf.requestorDepartment || 'N/A'}</td>
                                    <td style={cellStyle}>{mrf.totalAmount?.toFixed(2)} AED</td>
                                    <td style={statusCellStyle(mrf.status)}>{mrf.status}</td>
                                    <td style={cellStyle}>{getApproverType(mrf.requiresSuperadmin)}</td>
                                    <td style={cellStyle}>{formatDateTime(mrf.creationDate)}</td>
                                    <td style={cellStyle}>{formatDateTime(mrf.approvalDate)}</td>
                                    <td style={cellStyle}>
                                        <button
                                            onClick={() => handleToggleExpand(mrf.id)}
                                            style={expandButtonStyle}
                                        >
                                            {expandedMRF === mrf.id ? 'Hide' : 'View'} Items
                                        </button>
                                        
                                        {selectedAction === 'edit' && mrf.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleEdit(mrf)}
                                                style={editButtonStyle}
                                            >
                                                Edit
                                            </button>
                                        )}
                                        
                                        {selectedAction === 'delete' && mrf.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleDelete(mrf)}
                                                style={deleteButtonStyle}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                                
                                {expandedMRF === mrf.id && (
                                    <tr style={expandedRowStyle}>
                                        <td colSpan="9" style={{...cellStyle, padding: '20px'}}>
                                            <div style={{marginBottom: '15px'}}>
                                                <strong>Reason/Justification:</strong>
                                                <div style={{marginTop: '5px', padding: '10px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #dee2e6'}}>
                                                    {mrf.reasonJustification}
                                                </div>
                                            </div>
                                            
                                            {mrf.status === 'REJECTED' && mrf.rejectionReason && (
                                                <div style={{marginBottom: '15px'}}>
                                                    <strong style={{color: '#dc3545'}}>Rejection Reason:</strong>
                                                    <div style={{marginTop: '5px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', border: '1px solid #dc3545', color: '#721c24'}}>
                                                        {mrf.rejectionReason}
                                                    </div>
                                                </div>
                                            )}
                                            
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
        </div>
    );
};

export default MRFList;