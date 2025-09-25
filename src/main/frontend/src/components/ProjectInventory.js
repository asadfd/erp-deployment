import React, { useState, useEffect } from 'react';
import PurchaseOrderForm from './PurchaseOrderForm';

const ProjectInventory = ({ projectId, projectBudget, onExpenseUpdate, refreshTrigger }) => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [projectInventoryItems, setProjectInventoryItems] = useState([]);
    const [selectedInventory, setSelectedInventory] = useState('');
    const [requiredQuantity, setRequiredQuantity] = useState('');
    const [totalExpense, setTotalExpense] = useState(0);
    const [loading, setLoading] = useState(true);
    const [poFormOpen, setPoFormOpen] = useState(false);
    const [selectedItemForPO, setSelectedItemForPO] = useState(null);

    useEffect(() => {
        fetchInventoryItems();
        fetchProjectInventoryItems();
    }, [projectId]);

    useEffect(() => {
        calculateTotalExpense();
    }, [projectInventoryItems]);

    useEffect(() => {
        if (refreshTrigger) {
            fetchInventoryItems();
            fetchProjectInventoryItems();
        }
    }, [refreshTrigger]);

    const fetchInventoryItems = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/inventory', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setInventoryItems(data);
            } else {
                console.error('Failed to fetch inventory items');
            }
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectInventoryItems = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/inventory`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                const displayItems = data.map(item => ({
                    id: item.id,
                    inventoryId: item.inventory.id,
                    inventoryName: item.inventory.name,
                    requiredQuantity: item.requiredQuantity,
                    availableQuantity: item.allocatedQuantity,
                    shortage: item.shortageQuantity,
                    perQuantityPrice: item.unitPrice,
                    quantity: item.allocatedQuantity,
                    hasShortage: item.shortageQuantity > 0
                }));
                setProjectInventoryItems(displayItems);
            } else {
                console.error('Failed to fetch project inventory items');
            }
        } catch (error) {
            console.error('Error fetching project inventory items:', error);
        }
    };

    const calculateTotalExpense = () => {
        const total = projectInventoryItems.reduce((sum, item) => {
            return sum + (item.quantity * item.perQuantityPrice);
        }, 0);
        setTotalExpense(total);
        onExpenseUpdate && onExpenseUpdate(total);
    };

    const handleAddInventoryItem = async () => {
        if (!selectedInventory || !requiredQuantity) {
            alert('Please select an inventory item and enter quantity');
            return;
        }

        try {
            const response = await fetch(`/api/projects/${projectId}/inventory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    inventoryId: parseInt(selectedInventory),
                    requiredQuantity: parseInt(requiredQuantity)
                })
            });

            if (response.ok) {
                const savedItem = await response.json();
                
                // Create display item
                const displayItem = {
                    id: savedItem.id,
                    inventoryId: savedItem.inventory.id,
                    inventoryName: savedItem.inventory.name,
                    requiredQuantity: savedItem.requiredQuantity,
                    availableQuantity: savedItem.allocatedQuantity,
                    shortage: savedItem.shortageQuantity,
                    perQuantityPrice: savedItem.unitPrice,
                    quantity: savedItem.allocatedQuantity,
                    hasShortage: savedItem.shortageQuantity > 0
                };
                
                setProjectInventoryItems([...projectInventoryItems, displayItem]);
                setSelectedInventory('');
                setRequiredQuantity('');
                
                // Refresh inventory list to show updated quantities
                fetchInventoryItems();
            } else {
                alert('Failed to add inventory item to project');
            }
        } catch (error) {
            console.error('Error adding inventory item:', error);
            alert('Error adding inventory item to project');
        }
    };

    const handleRemoveInventoryItem = async (itemId) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/inventory/${itemId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setProjectInventoryItems(projectInventoryItems.filter(item => item.id !== itemId));
                // Refresh inventory list to show updated quantities
                fetchInventoryItems();
            } else {
                alert('Failed to remove inventory item from project');
            }
        } catch (error) {
            console.error('Error removing inventory item:', error);
            alert('Error removing inventory item from project');
        }
    };

    const handleCreatePO = (item) => {
        setSelectedItemForPO(item);
        setPoFormOpen(true);
    };

    const handlePOSuccess = (result) => {
        // Refresh the project inventory items to reflect PO creation
        fetchProjectInventoryItems();
    };

    const containerStyle = {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '20px'
    };

    const formRowStyle = {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr auto',
        gap: '15px',
        marginBottom: '20px',
        alignItems: 'end'
    };

    const formGroupStyle = {
        display: 'flex',
        flexDirection: 'column'
    };

    const labelStyle = {
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333',
        fontSize: '14px'
    };

    const inputStyle = {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    };

    const buttonStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '20px'
    };

    const thStyle = {
        backgroundColor: '#f8f9fa',
        color: '#333',
        fontWeight: 'bold',
        padding: '12px 8px',
        textAlign: 'left',
        borderBottom: '2px solid #dee2e6',
        fontSize: '12px'
    };

    const tdStyle = {
        padding: '8px',
        borderBottom: '1px solid #dee2e6',
        fontSize: '12px'
    };

    const createPOButtonStyle = {
        backgroundColor: '#ffc107',
        color: '#212529',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '10px',
        fontWeight: 'bold'
    };

    const removeButtonStyle = {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '10px',
        marginLeft: '5px'
    };

    if (loading) {
        return <div>Loading inventory items...</div>;
    }

    return (
        <div style={containerStyle}>
            <h4 style={{ color: '#333', marginBottom: '20px' }}>Project Inventory Details</h4>
            
            <div style={formRowStyle}>
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Select Inventory Item</label>
                    <select
                        value={selectedInventory}
                        onChange={(e) => setSelectedInventory(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">Select an inventory item</option>
                        {inventoryItems.map(item => (
                            <option key={item.id} value={item.id}>
                                {item.name} - Available: {item.quantity} - Price: AED {item.perQuantityPrice}
                            </option>
                        ))}
                    </select>
                </div>
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Required Quantity</label>
                    <input
                        type="number"
                        min="1"
                        value={requiredQuantity}
                        onChange={(e) => setRequiredQuantity(e.target.value)}
                        style={inputStyle}
                        placeholder="Enter quantity"
                    />
                </div>
                <button onClick={handleAddInventoryItem} style={buttonStyle}>
                    Add Item
                </button>
            </div>

            {projectInventoryItems.length > 0 && (
                <div>
                    <h5 style={{ color: '#333', marginBottom: '15px' }}>Selected Inventory Items</h5>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Inventory ID</th>
                                <th style={thStyle}>Item Name</th>
                                <th style={thStyle}>Required Qty</th>
                                <th style={thStyle}>Available Qty</th>
                                <th style={thStyle}>Shortage</th>
                                <th style={thStyle}>Unit Price</th>
                                <th style={thStyle}>Total Price</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectInventoryItems.map(item => (
                                <tr key={item.id}>
                                    <td style={tdStyle}>{item.inventoryId}</td>
                                    <td style={tdStyle}>{item.inventoryName}</td>
                                    <td style={tdStyle}>{item.requiredQuantity}</td>
                                    <td style={tdStyle}>{item.availableQuantity}</td>
                                    <td style={tdStyle}>{item.shortage > 0 ? item.shortage : 'None'}</td>
                                    <td style={tdStyle}>AED {item.perQuantityPrice}</td>
                                    <td style={tdStyle}>AED {(item.availableQuantity * item.perQuantityPrice).toFixed(2)}</td>
                                    <td style={tdStyle}>
                                        {item.hasShortage && (
                                            <button
                                                onClick={() => handleCreatePO(item)}
                                                style={createPOButtonStyle}
                                            >
                                                Create PO
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleRemoveInventoryItem(item.id)}
                                            style={removeButtonStyle}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        backgroundColor: '#e9ecef', 
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <strong>Total Inventory Expense: AED {totalExpense.toFixed(2)}</strong>
                        </div>
                        <div>
                            <strong>Remaining Budget: AED {(projectBudget - totalExpense).toFixed(2)}</strong>
                            {totalExpense > projectBudget && (
                                <span style={{ color: '#dc3545', marginLeft: '10px' }}>
                                    (Over Budget!)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <PurchaseOrderForm
                isOpen={poFormOpen}
                onClose={() => setPoFormOpen(false)}
                projectId={projectId}
                projectInventoryItem={selectedItemForPO}
                onSuccess={handlePOSuccess}
            />
        </div>
    );
};

export default ProjectInventory;