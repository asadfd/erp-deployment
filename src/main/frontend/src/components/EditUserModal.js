import React, { useState } from 'react';
import axios from 'axios';

const EditUserModal = ({ isOpen, onClose, onUserUpdated }) => {
  const [searchUsername, setSearchUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    if (!searchUsername.trim()) {
      setSearchError('Please enter a username to search');
      return;
    }

    setLoading(true);
    setSearchError('');
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.get(`/api/users/${searchUsername}`);
      if (response.data.success) {
        setUserData(response.data);
        setNewUsername(response.data.username);
        setNewPassword('');
      } else {
        setSearchError('User not found');
        setUserData(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('User not found');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData) {
      setError('Please search for a user first');
      return;
    }

    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        username: newUsername.trim()
      };
      
      if (newPassword.trim()) {
        updateData.password = newPassword;
      }

      const response = await axios.put(`/api/users/${userData.id}`, updateData);
      
      if (response.data.success) {
        setSuccess('User updated successfully!');
        setTimeout(() => {
          onUserUpdated(response.data.user);
          resetForm();
        }, 1500);
      } else {
        setError(response.data.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError('Failed to update user');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchUsername('');
    setUserData(null);
    setNewUsername('');
    setNewPassword('');
    setError('');
    setSuccess('');
    setSearchError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Edit User</h2>
        
        {/* Search Section */}
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#666' }}>Search User</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Enter username"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {searchError && (
            <p style={{ color: '#dc3545', marginTop: '0.5rem' }}>{searchError}</p>
          )}
        </div>

        {/* Edit Form */}
        {userData && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                User ID
              </label>
              <input
                type="text"
                value={userData.id}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px',
                  backgroundColor: '#e9ecef'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                New Password (leave empty to keep current)
              </label>
              <input
                type="password"
                id="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem',
                border: '1px solid #c3e6cb'
              }}>
                {success}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !userData}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading || !userData ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading || !userData ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {loading ? 'Updating...' : 'Save'}
              </button>
            </div>
          </form>
        )}

        {/* If no user data yet */}
        {!userData && !searchError && (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
            Search for a user to edit their details
          </p>
        )}
      </div>
    </div>
  );
};

export default EditUserModal;