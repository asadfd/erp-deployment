import React, { useState, useEffect } from 'react';

const PurchaseOrderForm = ({ isOpen, onClose, projectId, projectInventoryItem, onSuccess }) => {
    const [formData, setFormData] = useState({
        supplierName: '',
        supplierContact: '',
        supplierEmail: '',
        supplierAddress: '',
        expectedDeliveryDate: '',
        paymentTerms: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (projectInventoryItem && isOpen) {
            // Pre-fill supplier name from inventory if available
            if (projectInventoryItem.inventory && projectInventoryItem.inventory.supplierName) {
                setFormData(prev => ({
                    ...prev,
                    supplierName: projectInventoryItem.inventory.supplierName
                }));
            }
        }
    }, [projectInventoryItem, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.supplierName.trim()) {
            alert('Supplier name is required');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/inventory/${projectInventoryItem.id}/create-po`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    supplierName: formData.supplierName,
                    supplierContact: formData.supplierContact,
                    supplierEmail: formData.supplierEmail,
                    supplierAddress: formData.supplierAddress,
                    expectedDeliveryDate: formData.expectedDeliveryDate,
                    paymentTerms: formData.paymentTerms,
                    notes: formData.notes
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Purchase Order created successfully!\nPO Number: ${result.poId}\nQuantity: ${projectInventoryItem.shortage} units of ${projectInventoryItem.inventoryName}`);
                onSuccess && onSuccess(result);
                onClose();
                resetForm();
            } else {
                const error = await response.json();
                alert(`Failed to create Purchase Order: ${error.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error creating PO:', error);
            alert('Error creating Purchase Order');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            supplierName: '',
            supplierContact: '',
            supplierEmail: '',
            supplierAddress: '',
            expectedDeliveryDate: '',
            paymentTerms: '',
            notes: ''
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #007bff'
    };

    const titleStyle = {
        margin: 0,
        color: '#333',
        fontSize: '20px'
    };

    const closeButtonStyle = {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#666',
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const formGroupStyle = {
        marginBottom: '15px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333',
        fontSize: '14px'
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
        minHeight: '80px',
        resize: 'vertical'
    };

    const itemInfoStyle = {
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '6px',
        marginBottom: '20px',
        border: '1px solid #e9ecef'
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        marginTop: '20px'
    };

    const submitButtonStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        opacity: loading ? 0.7 : 1
    };

    const cancelButtonStyle = {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    };

    return (
        <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div style={modalStyle}>
                <div style={headerStyle}>
                    <h3 style={titleStyle}>Create Purchase Order</h3>
                    <button style={closeButtonStyle} onClick={handleClose}>&times;</button>
                </div>

                {projectInventoryItem && (
                    <div style={itemInfoStyle}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>Item Details</h4>
                        <div><strong>Item:</strong> {projectInventoryItem.inventoryName}</div>
                        <div><strong>Shortage Quantity:</strong> {projectInventoryItem.shortage} units</div>
                        <div><strong>Unit Price:</strong> AED {projectInventoryItem.perQuantityPrice}</div>
                        <div><strong>Total Amount:</strong> AED {(projectInventoryItem.shortage * projectInventoryItem.perQuantityPrice).toFixed(2)}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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

                    <div style={buttonContainerStyle}>
                        <button 
                            type="button" 
                            onClick={handleClose}
                            style={cancelButtonStyle}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            style={submitButtonStyle}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Purchase Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseOrderForm;