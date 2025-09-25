import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreatePurchaseOrder = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [inventories, setInventories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        projectId: '',
        supplierName: '',
        supplierContact: '',
        supplierEmail: '',
        supplierAddress: '',
        expectedDeliveryDate: '',
        paymentTerms: '',
        notes: ''
    });
    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [projectsResponse, inventoryResponse] = await Promise.all([
                fetch('/api/projects', { credentials: 'include' }),
                fetch('/api/inventory', { credentials: 'include' })
            ]);

            if (projectsResponse.ok && inventoryResponse.ok) {
                const projectsData = await projectsResponse.json();
                const inventoryData = await inventoryResponse.json();
                setProjects(projectsData);
                setInventories(inventoryData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddItem = () => {
        setSelectedItems([...selectedItems, { inventoryId: '', quantity: 1 }]);
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...selectedItems];
        updatedItems[index][field] = value;
        setSelectedItems(updatedItems);
    };

    const handleRemoveItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return selectedItems.reduce((total, item) => {
            const inventory = inventories.find(inv => inv.id === parseInt(item.inventoryId));
            if (inventory) {
                return total + (inventory.perQuantityPrice * item.quantity);
            }
            return total;
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.projectId || !formData.supplierName || selectedItems.length === 0) {
            alert('Please fill in all required fields and add at least one item');
            return;
        }

        setLoading(true);
        try {
            const project = projects.find(p => p.id === parseInt(formData.projectId));
            const purchaseOrder = {
                project: { id: project.id },
                supplierName: formData.supplierName,
                supplierContact: formData.supplierContact,
                supplierEmail: formData.supplierEmail,
                supplierAddress: formData.supplierAddress,
                expectedDeliveryDate: formData.expectedDeliveryDate || null,
                paymentTerms: formData.paymentTerms,
                notes: formData.notes
            };

            const inventoryIds = selectedItems.map(item => parseInt(item.inventoryId));
            const quantities = selectedItems.map(item => parseInt(item.quantity));

            const response = await fetch('/api/purchase-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    purchaseOrder,
                    inventoryIds,
                    quantities,
                    projectId: parseInt(formData.projectId)
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Purchase Order created successfully!\nPO Number: ${result.poNumber}`);
                navigate('/purchase-orders');
            } else {
                alert('Failed to create Purchase Order');
            }
        } catch (error) {
            console.error('Error creating PO:', error);
            alert('Error creating Purchase Order');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
    };

    const headerStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderRadius: '8px'
    };

    const formContainerStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        maxWidth: '800px',
        margin: '0 auto'
    };

    const formGroupStyle = {
        marginBottom: '20px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        boxSizing: 'border-box'
    };

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer'
    };

    const textareaStyle = {
        ...inputStyle,
        minHeight: '80px',
        resize: 'vertical'
    };

    const itemsContainerStyle = {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '20px'
    };

    const itemRowStyle = {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
        alignItems: 'center'
    };

    const buttonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    };

    const addButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#28a745',
        color: 'white',
        marginBottom: '20px'
    };

    const removeButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#dc3545',
        color: 'white',
        padding: '8px 15px'
    };

    const submitButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#007bff',
        color: 'white',
        marginRight: '10px'
    };

    const cancelButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#6c757d',
        color: 'white'
    };

    const totalStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#007bff',
        textAlign: 'right',
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={{ margin: 0 }}>Create Purchase Order</h1>
                <button onClick={() => navigate('/dashboard')} style={cancelButtonStyle}>
                    Back to Dashboard
                </button>
            </div>

            <div style={formContainerStyle}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Project *</label>
                            <select
                                name="projectId"
                                value={formData.projectId}
                                onChange={handleInputChange}
                                style={selectStyle}
                                required
                            >
                                <option value="">Select a project</option>
                                {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.projectDescription || `Project ${project.id}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Supplier Name *</label>
                            <input
                                type="text"
                                name="supplierName"
                                value={formData.supplierName}
                                onChange={handleInputChange}
                                style={inputStyle}
                                required
                                placeholder="Enter supplier name"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Supplier Contact</label>
                            <input
                                type="text"
                                name="supplierContact"
                                value={formData.supplierContact}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="Phone number or contact person"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Supplier Email</label>
                            <input
                                type="email"
                                name="supplierEmail"
                                value={formData.supplierEmail}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="supplier@example.com"
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Expected Delivery Date</label>
                            <input
                                type="date"
                                name="expectedDeliveryDate"
                                value={formData.expectedDeliveryDate}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                        </div>

                        <div style={formGroupStyle}>
                            <label style={labelStyle}>Payment Terms</label>
                            <input
                                type="text"
                                name="paymentTerms"
                                value={formData.paymentTerms}
                                onChange={handleInputChange}
                                style={inputStyle}
                                placeholder="e.g., Net 30, 50% advance"
                            />
                        </div>
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Supplier Address</label>
                        <textarea
                            name="supplierAddress"
                            value={formData.supplierAddress}
                            onChange={handleInputChange}
                            style={textareaStyle}
                            placeholder="Enter supplier address"
                        />
                    </div>

                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            style={textareaStyle}
                            placeholder="Additional notes or requirements"
                        />
                    </div>

                    <div style={itemsContainerStyle}>
                        <h3>Items</h3>
                        <button type="button" onClick={handleAddItem} style={addButtonStyle}>
                            + Add Item
                        </button>

                        {selectedItems.map((item, index) => (
                            <div key={index} style={itemRowStyle}>
                                <select
                                    value={item.inventoryId}
                                    onChange={(e) => handleItemChange(index, 'inventoryId', e.target.value)}
                                    style={{ ...selectStyle, flex: 2 }}
                                    required
                                >
                                    <option value="">Select an item</option>
                                    {inventories.map(inv => (
                                        <option key={inv.id} value={inv.id}>
                                            {inv.name} - AED {inv.perQuantityPrice}/unit
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                    min="1"
                                    required
                                    placeholder="Quantity"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    style={removeButtonStyle}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        {selectedItems.length > 0 && (
                            <div style={totalStyle}>
                                Total: AED {calculateTotal().toFixed(2)}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <button type="submit" style={submitButtonStyle} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Purchase Order'}
                        </button>
                        <button type="button" onClick={() => navigate('/dashboard')} style={cancelButtonStyle}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePurchaseOrder;