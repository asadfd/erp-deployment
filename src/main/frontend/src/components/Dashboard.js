import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserManagement from './UserManagement';
import EmployeeManagement from './EmployeeManagement';
import ApprovalPending from './ApprovalPending';
import Notifications from './Notifications';
import ProjectManager from './ProjectManager';

const Dashboard = ({ user, userRoles, onLogout }) => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

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
        <div style={{ fontSize: '1.2rem' }}>
          Welcome, {user}!
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
      
      <div style={{
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Login Successful! Welcome to the ERP System, <strong>{user}</strong>.
        </div>
        <p>This is your dashboard landing page.</p>
        
        {userRoles && userRoles.some(role => role.authority === 'ROLE_SUPER_ADMIN') && (
          <>
            <UserManagement />
            <ApprovalPending />
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Material Request Forms</h3>
              <p style={{ marginBottom: '1.5rem', color: '#6c757d' }}>
                Review and approve material request forms from project managers
              </p>
              <button
                onClick={() => navigate('/mrf')}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              >
                📋 MRF Approval Dashboard
              </button>
            </div>
          </>
        )}
        
        {userRoles && userRoles.some(role => role.authority === 'ROLE_PROJECTMANAGER') && (
          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Material Request Forms</h3>
            <p style={{ marginBottom: '1.5rem', color: '#6c757d' }}>
              Create and manage material request forms with approval workflow
            </p>
            <button
              onClick={() => navigate('/mrf')}
              style={{
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a2d91'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6f42c1'}
            >
              📋 MRF Management
            </button>
          </div>
        )}
        
        {userRoles && userRoles.some(role => role.authority === 'ROLE_HRMANAGER') && (
          <>
            <EmployeeManagement />
            <Notifications />
          </>
        )}
        
        {userRoles && userRoles.some(role => role.authority === 'ROLE_ADMIN') && (
          <>
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Material Request Forms</h3>
              <p style={{ marginBottom: '1.5rem', color: '#6c757d' }}>
                Review and approve material request forms under 2,000 AED
              </p>
              <button
                onClick={() => navigate('/mrf')}
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#138496'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#17a2b8'}
              >
                📋 MRF Approval Dashboard
              </button>
            </div>
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Reports & Analytics</h3>
              <p style={{ marginBottom: '1.5rem', color: '#6c757d' }}>
                Access comprehensive financial and operational reports for all projects
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <button
                onClick={() => navigate('/reports/cashflow')}
                style={{
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#138496'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#17a2b8'}
              >
                📊 Cash Flow Report
              </button>
              <button
                onClick={() => navigate('/reports/employee-hours')}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
              >
                ⏰ Employee Hours Report
              </button>
              <button
                onClick={() => navigate('/reports/project-breakdown')}
                style={{
                  backgroundColor: '#fd7e14',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e56e0b'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#fd7e14'}
              >
                📈 Project Breakdown
              </button>
            </div>
            </div>
          </>
        )}
        
        {userRoles && userRoles.some(role => role.authority === 'ROLE_PROJECTMANAGER') && (
          <>
            <ProjectManager />
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Inventory Management</h3>
              <button
                onClick={() => navigate('/inventory')}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Go to Inventory Management
              </button>
            </div>
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Purchase Order Management</h3>
              <p style={{ marginBottom: '1rem', color: '#6c757d' }}>
                Track and manage all purchase orders for your projects
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/purchase-orders/create')}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Create PO
                </button>
                <button
                  onClick={() => navigate('/purchase-orders')}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  List POs
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;