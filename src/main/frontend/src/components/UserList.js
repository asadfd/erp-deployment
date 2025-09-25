import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserList = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/list');
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleNames = (roles) => {
    return roles.map(role => role.name).join(', ');
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    overflow: 'hidden'
  };

  const thStyle = {
    backgroundColor: '#f8f9fa',
    color: '#333',
    fontWeight: 'bold',
    padding: '12px 16px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6'
  };

  const tdStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #dee2e6'
  };

  const statusStyle = (enabled) => ({
    ...tdStyle,
    color: enabled ? '#28a745' : '#dc3545',
    fontWeight: 'bold'
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#dc3545' }}>{error}</p>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Back to User Management
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <h2 style={{ color: '#333', margin: 0 }}>User List</h2>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to User Management
        </button>
      </div>

      {users.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No users found.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Username</th>
              <th style={thStyle}>Roles</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                <td style={tdStyle}>{user.username}</td>
                <td style={tdStyle}>{getRoleNames(user.roles)}</td>
                <td style={statusStyle(user.enabled)}>
                  {user.enabled ? 'Active' : 'Inactive'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        Total users: {users.length}
      </div>
    </div>
  );
};

export default UserList;