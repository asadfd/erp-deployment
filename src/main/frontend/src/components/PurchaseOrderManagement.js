import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PurchaseOrderManagement = () => {
    const navigate = useNavigate();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPO, setSelectedPO] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchPurchaseOrders(),
                fetchProjects()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchaseOrders = async () => {
        try {
            const response = await fetch('/api/purchase-orders', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPurchaseOrders(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const getProjectName = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.projectDescription || `Project ${project.id}` : 'Unknown Project';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        return new Date(dateTimeString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CREATED': return '#6c757d';
            case 'SENT_TO_SUPPLIER': return '#007bff';
            case 'SUPPLIER_ACCEPTED': return '#28a745';
            case 'SUPPLIER_REJECTED': return '#dc3545';
            case 'IN_PRODUCTION': return '#ffc107';
            case 'SHIPPED': return '#17a2b8';
            case 'DELIVERED': return '#20c997';
            case 'COMPLETED': return '#198754';
            case 'CANCELLED': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const handleDeletePO = async (poId) => {
        if (!window.confirm('Are you sure you want to delete this Purchase Order?')) {
            return;
        }

        try {
            const response = await fetch(`/api/purchase-orders/${poId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                alert('Purchase Order deleted successfully');
                fetchPurchaseOrders();
            } else {
                alert('Failed to delete Purchase Order');
            }
        } catch (error) {
            console.error('Error deleting PO:', error);
            alert('Error deleting Purchase Order');
        }
    };

    const handleStatusUpdate = async (poId, newStatus) => {
        try {
            const response = await fetch(`/api/purchase-orders/${poId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                alert('Status updated successfully');
                fetchPurchaseOrders();
                if (selectedPO && selectedPO.id === poId) {
                    const updatedPO = await response.json();
                    setSelectedPO(updatedPO);
                }
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        }
    };

    const showPODetails = (po) => {
        setSelectedPO(po);
        setShowDetails(true);
    };

    const filteredPOs = (purchaseOrders || []).filter(po => 
        filterStatus === 'ALL' || po.poStatus === filterStatus
    );

    const containerStyle = {
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #007bff',
        flexWrap: 'wrap',
        gap: '10px'
    };

    const titleStyle = {
        margin: 0,
        color: '#333',
        fontSize: '24px'
    };

    const filterStyle = {
        padding: '8px 12px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: '4px',
        overflow: 'hidden'
    };

    const thStyle = {
        backgroundColor: '#f8f9fa',
        color: '#333',
        fontWeight: 'bold',
        padding: '12px 8px',
        textAlign: 'left',
        borderBottom: '2px solid #dee2e6',
        fontSize: '14px'
    };

    const tdStyle = {
        padding: '12px 8px',
        borderBottom: '1px solid #dee2e6',
        fontSize: '14px'
    };

    const buttonStyle = {
        padding: '6px 12px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        marginRight: '5px'
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    Loading Purchase Orders...
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={titleStyle}>Purchase Order Management</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/purchase-orders/create')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}
                    >
                        + Create New PO
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Filter by Status:</label>
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={filterStyle}
                        >
                            <option value="ALL">All Status</option>
                            <option value="CREATED">Created</option>
                            <option value="SENT_TO_SUPPLIER">Sent to Supplier</option>
                            <option value="SUPPLIER_ACCEPTED">Supplier Accepted</option>
                            <option value="SUPPLIER_REJECTED">Supplier Rejected</option>
                            <option value="IN_PRODUCTION">In Production</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {filteredPOs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                    No Purchase Orders found
                </div>
            ) : (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>PO Number</th>
                            <th style={thStyle}>Project</th>
                            <th style={thStyle}>Supplier</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Total Amount</th>
                            <th style={thStyle}>Created Date</th>
                            <th style={thStyle}>Expected Delivery</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPOs.map(po => (
                            <tr key={po.id} style={{ backgroundColor: po.id % 2 === 0 ? 'white' : '#f8f9fa' }}>
                                <td style={tdStyle}>
                                    <strong style={{ color: '#007bff' }}>{po.poNumber}</strong>
                                </td>
                                <td style={tdStyle}>
                                    {getProjectName(po.project?.id)}
                                </td>
                                <td style={tdStyle}>{po.supplierName}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        backgroundColor: getStatusColor(po.poStatus),
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {po.poStatus.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <strong>{formatCurrency(po.totalAmount)}</strong>
                                </td>
                                <td style={tdStyle}>{formatDateTime(po.createdDate)}</td>
                                <td style={tdStyle}>{formatDate(po.expectedDeliveryDate)}</td>
                                <td style={tdStyle}>
                                    <button
                                        onClick={() => showPODetails(po)}
                                        style={{
                                            ...buttonStyle,
                                            backgroundColor: '#17a2b8',
                                            color: 'white'
                                        }}
                                    >
                                        View
                                    </button>
                                    {po.poStatus === 'CREATED' && (
                                        <>
                                            <button
                                                onClick={() => showPODetails(po)}
                                                style={{
                                                    ...buttonStyle,
                                                    backgroundColor: '#28a745',
                                                    color: 'white'
                                                }}
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => handleDeletePO(po.id)}
                                                style={{
                                                    ...buttonStyle,
                                                    backgroundColor: '#dc3545',
                                                    color: 'white'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showDetails && selectedPO && (
                <PODetailsModal
                    po={selectedPO}
                    onClose={() => setShowDetails(false)}
                    onStatusUpdate={handleStatusUpdate}
                    getProjectName={getProjectName}
                />
            )}
        </div>
    );
};

const PODetailsModal = ({ po, onClose, onStatusUpdate, getProjectName }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPOItems();
    }, [po.id]);

    const fetchPOItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/purchase-orders/${po.id}/items`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching PO items:', error);
        } finally {
            setLoading(false);
        }
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    };

    const modalStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    };

    const statuses = [
        'CREATED', 'SENT_TO_SUPPLIER', 'SUPPLIER_ACCEPTED', 'SUPPLIER_REJECTED',
        'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED'
    ];

    return (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={modalStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Purchase Order Details</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px' }}>×</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                        <h4>Basic Information</h4>
                        <p><strong>PO Number:</strong> {po.poNumber}</p>
                        <p><strong>Project:</strong> {getProjectName(po.project?.id)}</p>
                        <p><strong>Supplier:</strong> {po.supplierName}</p>
                        <p><strong>Contact:</strong> {po.supplierContact || 'N/A'}</p>
                        <p><strong>Email:</strong> {po.supplierEmail || 'N/A'}</p>
                        <p><strong>Total Amount:</strong> <strong style={{ color: '#007bff' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(po.totalAmount)}</strong></p>
                    </div>
                    <div>
                        <h4>Status & Dates</h4>
                        <p><strong>Status:</strong> 
                            <select 
                                value={po.poStatus} 
                                onChange={(e) => onStatusUpdate(po.id, e.target.value)}
                                style={{ marginLeft: '10px', padding: '4px 8px' }}
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>
                                        {status.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </p>
                        <p><strong>Created:</strong> {new Date(po.createdDate).toLocaleString()}</p>
                        <p><strong>Expected Delivery:</strong> {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'N/A'}</p>
                        <p><strong>Created By:</strong> {po.createdBy}</p>
                        <p><strong>Payment Terms:</strong> {po.paymentTerms || 'N/A'}</p>
                    </div>
                </div>

                {po.notes && (
                    <div style={{ marginBottom: '20px' }}>
                        <h4>Notes</h4>
                        <p style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>{po.notes}</p>
                    </div>
                )}

                <div>
                    <h4>Items</h4>
                    {loading ? (
                        <p>Loading items...</p>
                    ) : items.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Item</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Quantity</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Unit Price</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id}>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.inventory?.name}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{item.quantityOrdered}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unitPrice)}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No items found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderManagement;