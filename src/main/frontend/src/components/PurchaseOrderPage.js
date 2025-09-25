import React from 'react';
import { useNavigate } from 'react-router-dom';
import PurchaseOrderManagement from './PurchaseOrderManagement';

const PurchaseOrderPage = () => {
    const navigate = useNavigate();

    const headerStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    };

    const titleStyle = {
        margin: 0,
        fontSize: '24px'
    };

    const backButtonStyle = {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
    };

    const containerStyle = {
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        margin: 0,
        padding: 0
    };

    const contentStyle = {
        padding: '20px'
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>Purchase Order Management</h1>
                <button 
                    onClick={() => navigate('/dashboard')}
                    style={backButtonStyle}
                >
                    Back to Dashboard
                </button>
            </div>
            <div style={contentStyle}>
                <PurchaseOrderManagement />
            </div>
        </div>
    );
};

export default PurchaseOrderPage;