import React, { useState } from 'react';
import InventoryForm from './InventoryForm';
import InventoryList from './InventoryList';

const InventoryManagement = () => {
    const [currentView, setCurrentView] = useState('main');
    const [editingInventory, setEditingInventory] = useState(null);

    const handleCreateInventory = () => {
        setEditingInventory(null);
        setCurrentView('form');
    };

    const handleEditInventory = (inventory) => {
        setEditingInventory(inventory);
        setCurrentView('form');
    };

    const handleBackToMain = () => {
        setCurrentView('main');
        setEditingInventory(null);
    };

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

    const buttonContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    };

    const buttonStyle = {
        padding: '15px 20px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'background-color 0.3s ease',
        color: 'white'
    };

    const createButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#28a745'
    };

    const updateButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#007bff'
    };

    const deleteButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#dc3545'
    };

    const listButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#6f42c1'
    };

    if (currentView === 'form') {
        return (
            <div style={containerStyle}>
                <InventoryForm 
                    editingInventory={editingInventory}
                    onBack={handleBackToMain}
                />
            </div>
        );
    }

    if (currentView === 'list') {
        return (
            <div style={containerStyle}>
                <InventoryList 
                    onBack={handleBackToMain}
                    onEdit={handleEditInventory}
                />
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>Inventory Management</h2>
            
            <div style={buttonContainerStyle}>
                <button 
                    style={createButtonStyle}
                    onClick={handleCreateInventory}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                    Create Inventory
                </button>
                
                <button 
                    style={updateButtonStyle}
                    onClick={() => setCurrentView('list')}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                    Update Inventory
                </button>
                
                <button 
                    style={deleteButtonStyle}
                    onClick={() => setCurrentView('list')}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                    Delete Inventory
                </button>
                
                <button 
                    style={listButtonStyle}
                    onClick={() => setCurrentView('list')}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#5a32a3'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#6f42c1'}
                >
                    List Inventory
                </button>
            </div>
        </div>
    );
};

export default InventoryManagement;