import React, { useState, useEffect } from 'react';

const InventoryForm = ({ editingInventory, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        productionDate: '',
        expiryDate: '',
        quantity: '',
        perQuantityPrice: '',
        billNumber: '',
        supplierName: ''
    });
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingInventory) {
            setFormData({
                name: editingInventory.name || '',
                productionDate: editingInventory.productionDate || '',
                expiryDate: editingInventory.expiryDate || '',
                quantity: editingInventory.quantity || '',
                perQuantityPrice: editingInventory.perQuantityPrice || '',
                billNumber: editingInventory.billNumber || '',
                supplierName: editingInventory.supplierName || ''
            });
        }
    }, [editingInventory]);

    useEffect(() => {
        const quantity = parseFloat(formData.quantity) || 0;
        const price = parseFloat(formData.perQuantityPrice) || 0;
        setTotalPrice(quantity * price);
    }, [formData.quantity, formData.perQuantityPrice]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            alert('Name is required');
            return false;
        }
        if (!formData.productionDate) {
            alert('Production date is required');
            return false;
        }
        if (!formData.expiryDate) {
            alert('Expiry date is required');
            return false;
        }
        if (new Date(formData.productionDate) >= new Date(formData.expiryDate)) {
            alert('Production date must be before expiry date');
            return false;
        }
        if (!formData.quantity || formData.quantity <= 0) {
            alert('Valid quantity is required');
            return false;
        }
        if (!formData.perQuantityPrice || formData.perQuantityPrice <= 0) {
            alert('Valid price per quantity is required');
            return false;
        }
        if (!formData.billNumber.trim()) {
            alert('Bill number is required');
            return false;
        }
        if (!formData.supplierName.trim()) {
            alert('Supplier name is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const url = editingInventory 
                ? `/api/inventory/request/update/${editingInventory.inventoryId}`
                : '/api/inventory/request/create';
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    quantity: parseInt(formData.quantity),
                    perQuantityPrice: parseFloat(formData.perQuantityPrice)
                })
            });

            if (response.ok) {
                const action = editingInventory ? 'update' : 'creation';
                alert(`Inventory ${action} request submitted successfully! Waiting for admin approval.`);
                onBack();
            } else {
                alert(`Failed to submit inventory request`);
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Error submitting inventory request');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
    };

    const titleStyle = {
        marginBottom: '30px',
        color: '#333',
        textAlign: 'center'
    };

    const formStyle = {
        backgroundColor: '#f8f9fa',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };

    const rowStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
    };

    const fullRowStyle = {
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

    const totalPriceStyle = {
        ...inputStyle,
        backgroundColor: '#e9ecef',
        color: '#495057',
        fontWeight: 'bold'
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginTop: '30px'
    };

    const buttonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        minWidth: '120px'
    };

    const submitButtonStyle = {
        ...buttonStyle,
        backgroundColor: loading ? '#6c757d' : '#28a745',
        color: 'white'
    };

    const backButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#6c757d',
        color: 'white'
    };

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>
                {editingInventory ? 'Update Inventory Request' : 'Create Inventory Request'}
            </h2>

            <form onSubmit={handleSubmit} style={formStyle}>
                <div style={rowStyle}>
                    <div>
                        <label style={labelStyle}>Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Supplier Name *</label>
                        <input
                            type="text"
                            name="supplierName"
                            value={formData.supplierName}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                <div style={rowStyle}>
                    <div>
                        <label style={labelStyle}>Production Date *</label>
                        <input
                            type="date"
                            name="productionDate"
                            value={formData.productionDate}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Expiry Date *</label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                <div style={rowStyle}>
                    <div>
                        <label style={labelStyle}>Quantity *</label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            style={inputStyle}
                            min="1"
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Price per Quantity *</label>
                        <input
                            type="number"
                            name="perQuantityPrice"
                            value={formData.perQuantityPrice}
                            onChange={handleInputChange}
                            style={inputStyle}
                            step="0.01"
                            min="0.01"
                            required
                        />
                    </div>
                </div>

                <div style={rowStyle}>
                    <div>
                        <label style={labelStyle}>Bill Number *</label>
                        <input
                            type="text"
                            name="billNumber"
                            value={formData.billNumber}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Total Price (Auto-calculated)</label>
                        <input
                            type="text"
                            value={totalPrice.toFixed(2)}
                            style={totalPriceStyle}
                            readOnly
                        />
                    </div>
                </div>

                <div style={buttonContainerStyle}>
                    <button
                        type="submit"
                        style={submitButtonStyle}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : (editingInventory ? 'Submit Update Request' : 'Submit Create Request')}
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        style={backButtonStyle}
                        disabled={loading}
                    >
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InventoryForm;