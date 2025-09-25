import React from 'react';
import { useNavigate } from 'react-router-dom';
import InventoryManagement from './InventoryManagement';

const InventoryPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f8f9fa',
      margin: 0,
      padding: 0,
      minHeight: '100vh'
    }}>
      <div style={{
        backgroundColor: '#343a40',
        color: 'white',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>
          Inventory Management
        </h1>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>
      
      <div style={{
        padding: '2rem'
      }}>
        <InventoryManagement />
      </div>
    </div>
  );
};

export default InventoryPage;