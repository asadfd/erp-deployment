import React, { useState, useEffect } from 'react';

const InventoryList = ({ onBack, onEdit }) => {
    const [inventoryList, setInventoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAction, setSelectedAction] = useState('view'); // 'view', 'edit', 'delete'

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await fetch('/api/inventory', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setInventoryList(data);
            } else {
                alert('Failed to fetch inventory');
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
            alert('Error fetching inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (inventory) => {
        onEdit(inventory);
    };

    const handleDelete = async (inventory) => {
        if (window.confirm(`Are you sure you want to request deletion of "${inventory.name}" (${inventory.inventoryId})?`)) {
            try {
                const response = await fetch(`/api/inventory/request/delete/${inventory.inventoryId}`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('Delete request submitted successfully! Waiting for admin approval.');
                } else {
                    alert('Failed to submit delete request');
                }
            } catch (error) {
                console.error('Error submitting delete request:', error);
                alert('Error submitting delete request');
            }
        }
    };

    const containerStyle = {
        padding: '20px',
        maxWidth: '1200px',
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

    const actionButtonStyle = {
        padding: '5px 10px',
        border: 'none',
        borderRadius: '3px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginRight: '5px'
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
                <div style={loadingStyle}>Loading inventory...</div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>Inventory List</h2>
            
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

            {inventoryList.length === 0 ? (
                <div style={noDataStyle}>
                    No inventory items found
                </div>
            ) : (
                <table style={tableStyle}>
                    <thead style={headerStyle}>
                        <tr>
                            <th style={cellStyle}>Inventory ID</th>
                            <th style={cellStyle}>Name</th>
                            <th style={cellStyle}>Production Date</th>
                            <th style={cellStyle}>Expiry Date</th>
                            <th style={cellStyle}>Quantity</th>
                            <th style={cellStyle}>Price/Unit</th>
                            <th style={cellStyle}>Total Price</th>
                            <th style={cellStyle}>Supplier</th>
                            <th style={cellStyle}>Bill Number</th>
                            {selectedAction !== 'view' && <th style={cellStyle}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryList.map((item) => (
                            <tr key={item.id}>
                                <td style={cellStyle}>{item.inventoryId}</td>
                                <td style={cellStyle}>{item.name}</td>
                                <td style={cellStyle}>{item.productionDate}</td>
                                <td style={cellStyle}>{item.expiryDate}</td>
                                <td style={cellStyle}>{item.quantity}</td>
                                <td style={cellStyle}>${item.perQuantityPrice}</td>
                                <td style={cellStyle}>${item.totalPrice}</td>
                                <td style={cellStyle}>{item.supplierName}</td>
                                <td style={cellStyle}>{item.billNumber}</td>
                                {selectedAction === 'edit' && (
                                    <td style={cellStyle}>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            style={editButtonStyle}
                                        >
                                            Edit
                                        </button>
                                    </td>
                                )}
                                {selectedAction === 'delete' && (
                                    <td style={cellStyle}>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            style={deleteButtonStyle}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default InventoryList;