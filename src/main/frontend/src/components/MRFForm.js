import React, { useState, useEffect } from 'react';

const MRFForm = ({ editingMRF, onBack }) => {
    const [formData, setFormData] = useState({
        requestorName: '',
        requestorDepartment: '',
        requestorEmployeeId: '',
        reasonJustification: '',
        items: [{ itemDescription: '', quantity: '', specifications: '', unitPrice: '', amount: '' }]
    });
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingMRF) {
            setFormData({
                requestorName: editingMRF.requestorName || '',
                requestorDepartment: editingMRF.requestorDepartment || '',
                requestorEmployeeId: editingMRF.requestorEmployeeId || '',
                reasonJustification: editingMRF.reasonJustification || '',
                items: editingMRF.items && editingMRF.items.length > 0 
                    ? editingMRF.items.map(item => ({
                        id: item.id,
                        itemDescription: item.itemDescription || '',
                        quantity: item.quantity || '',
                        specifications: item.specifications || '',
                        unitPrice: item.unitPrice || '',
                        amount: item.amount || ''
                    }))
                    : [{ itemDescription: '', quantity: '', specifications: '', unitPrice: '', amount: '' }]
            });
        }
    }, [editingMRF]);

    useEffect(() => {
        calculateTotalAmount();
    }, [formData.items]);

    const calculateTotalAmount = () => {
        const total = formData.items.reduce((sum, item) => {
            const amount = parseFloat(item.amount) || 0;
            return sum + amount;
        }, 0);
        setTotalAmount(total);
    };

    const calculateItemAmount = (quantity, unitPrice) => {
        const qty = parseFloat(quantity) || 0;
        const price = parseFloat(unitPrice) || 0;
        return (qty * price).toFixed(2);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formData.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? value : updatedItems[index].quantity;
            const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice;
            updatedItems[index].amount = calculateItemAmount(quantity, unitPrice);
        }

        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { itemDescription: '', quantity: '', specifications: '', unitPrice: '', amount: '' }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }));
        }
    };

    const validateForm = () => {
        if (!formData.requestorName.trim()) {
            alert('Requestor name is required');
            return false;
        }
        if (!formData.reasonJustification.trim()) {
            alert('Reason/justification is required');
            return false;
        }
        
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i];
            if (!item.itemDescription.trim()) {
                alert(`Item description is required for item ${i + 1}`);
                return false;
            }
            if (!item.quantity || item.quantity <= 0) {
                alert(`Valid quantity is required for item ${i + 1}`);
                return false;
            }
            if (!item.unitPrice || item.unitPrice <= 0) {
                alert(`Valid unit price is required for item ${i + 1}`);
                return false;
            }
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
            const url = editingMRF 
                ? `/api/mrf/${editingMRF.id}`
                : '/api/mrf';
            
            const method = editingMRF ? 'PUT' : 'POST';
            
            const requestData = {
                ...formData,
                items: formData.items.map(item => ({
                    itemDescription: item.itemDescription,
                    quantity: parseInt(item.quantity),
                    specifications: item.specifications,
                    unitPrice: parseFloat(item.unitPrice)
                    // Remove amount as it's calculated on the backend
                }))
            };

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                const action = editingMRF ? 'updated' : 'created';
                const approver = totalAmount >= 2000 ? 'SuperAdmin' : 'Admin';
                alert(`MRF ${action} successfully! Total amount: ${totalAmount.toFixed(2)} AED. Sent to ${approver} for approval.`);
                onBack();
            } else {
                alert(`Failed to ${editingMRF ? 'update' : 'create'} MRF`);
            }
        } catch (error) {
            console.error('Error submitting MRF:', error);
            alert('Error submitting MRF');
        } finally {
            setLoading(false);
        }
    };

    // Styles
    const containerStyle = {
        padding: '20px',
        maxWidth: '1200px',
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

    const sectionStyle = {
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '6px',
        border: '1px solid #dee2e6'
    };

    const sectionTitleStyle = {
        marginBottom: '20px',
        color: '#495057',
        fontSize: '18px',
        fontWeight: 'bold',
        borderBottom: '2px solid #dee2e6',
        paddingBottom: '10px'
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

    const textareaStyle = {
        ...inputStyle,
        minHeight: '100px',
        resize: 'vertical'
    };

    const itemContainerStyle = {
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        padding: '15px',
        marginBottom: '15px',
        backgroundColor: '#f8f9fa'
    };

    const itemHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    };

    const itemTitleStyle = {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#495057'
    };

    const removeButtonStyle = {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 10px',
        fontSize: '12px',
        cursor: 'pointer'
    };

    const addButtonStyle = {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '10px 20px',
        fontSize: '14px',
        cursor: 'pointer',
        marginTop: '10px'
    };

    const totalStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: totalAmount >= 2000 ? '#dc3545' : '#28a745',
        textAlign: 'right',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '6px',
        border: '2px solid ' + (totalAmount >= 2000 ? '#dc3545' : '#28a745')
    };

    const approverNoteStyle = {
        fontSize: '14px',
        color: totalAmount >= 2000 ? '#dc3545' : '#28a745',
        textAlign: 'right',
        marginTop: '5px',
        fontWeight: 'bold'
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginTop: '30px'
    };

    const buttonStyle = {
        padding: '12px 24px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        minWidth: '140px'
    };

    const submitButtonStyle = {
        ...buttonStyle,
        backgroundColor: loading ? '#6c757d' : '#007bff',
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
                {editingMRF ? 'Edit Material Request Form' : 'Create Material Request Form'}
            </h2>

            <form onSubmit={handleSubmit} style={formStyle}>
                {/* Requestor Details Section */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>Requestor Details</h3>
                    
                    <div style={rowStyle}>
                        <div>
                            <label style={labelStyle}>Requestor Name *</label>
                            <input
                                type="text"
                                name="requestorName"
                                value={formData.requestorName}
                                onChange={handleInputChange}
                                style={inputStyle}
                                required
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Department</label>
                            <input
                                type="text"
                                name="requestorDepartment"
                                value={formData.requestorDepartment}
                                onChange={handleInputChange}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div style={fullRowStyle}>
                        <label style={labelStyle}>Employee ID</label>
                        <input
                            type="text"
                            name="requestorEmployeeId"
                            value={formData.requestorEmployeeId}
                            onChange={handleInputChange}
                            style={inputStyle}
                        />
                    </div>

                    <div style={fullRowStyle}>
                        <label style={labelStyle}>Reason/Justification *</label>
                        <textarea
                            name="reasonJustification"
                            value={formData.reasonJustification}
                            onChange={handleInputChange}
                            style={textareaStyle}
                            placeholder="Please provide detailed justification for this request..."
                            required
                        />
                    </div>
                </div>

                {/* Items Section */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>Requested Items</h3>
                    
                    {formData.items.map((item, index) => (
                        <div key={index} style={itemContainerStyle}>
                            <div style={itemHeaderStyle}>
                                <span style={itemTitleStyle}>Item {index + 1}</span>
                                {formData.items.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        style={removeButtonStyle}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div style={fullRowStyle}>
                                <label style={labelStyle}>Item Description *</label>
                                <input
                                    type="text"
                                    value={item.itemDescription}
                                    onChange={(e) => handleItemChange(index, 'itemDescription', e.target.value)}
                                    style={inputStyle}
                                    placeholder="Describe the item you need..."
                                    required
                                />
                            </div>

                            <div style={rowStyle}>
                                <div>
                                    <label style={labelStyle}>Quantity *</label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        style={inputStyle}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Unit Price (AED) *</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                        style={inputStyle}
                                        step="0.01"
                                        min="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div style={rowStyle}>
                                <div>
                                    <label style={labelStyle}>Specifications</label>
                                    <input
                                        type="text"
                                        value={item.specifications}
                                        onChange={(e) => handleItemChange(index, 'specifications', e.target.value)}
                                        style={inputStyle}
                                        placeholder="Technical specifications, brand, model, etc."
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Amount (Auto-calculated)</label>
                                    <input
                                        type="text"
                                        value={`${parseFloat(item.amount || 0).toFixed(2)} AED`}
                                        style={{...inputStyle, backgroundColor: '#e9ecef', fontWeight: 'bold'}}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addItem}
                        style={addButtonStyle}
                    >
                        + Add Another Item
                    </button>
                </div>

                {/* Total Amount Display */}
                <div style={totalStyle}>
                    Total Amount: {totalAmount.toFixed(2)} AED
                    <div style={approverNoteStyle}>
                        {totalAmount >= 2000 ? 'Requires SuperAdmin Approval' : 'Requires Admin Approval'}
                    </div>
                </div>

                <div style={buttonContainerStyle}>
                    <button
                        type="submit"
                        style={submitButtonStyle}
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : (editingMRF ? 'Update MRF' : 'Create MRF')}
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

export default MRFForm;