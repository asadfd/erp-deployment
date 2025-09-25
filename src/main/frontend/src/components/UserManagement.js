import React, { useState } from 'react';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';
import UserList from './UserList';

const UserManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserList, setShowUserList] = useState(false);

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleUserCreated = (userData) => {
    console.log('User created successfully:', userData);
    setShowCreateModal(false);
    setShowUserList(true);
  };

  const handleUserUpdated = (userData) => {
    console.log('User updated successfully:', userData);
    setShowEditModal(false);
    setShowUserList(true);
  };

  const handleUserDeleted = (userData) => {
    console.log('User deleted successfully:', userData);
    setShowDeleteModal(false);
    setShowUserList(true);
  };

  const handleUpdate = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleList = () => {
    setShowUserList(true);
  };

  const handleBackToManagement = () => {
    setShowUserList(false);
  };

  const buttonStyle = {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    color: 'white',
    backgroundColor: '#007bff',
    margin: '10px'
  };

  if (showUserList) {
    return <UserList onBack={handleBackToManagement} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#333', marginBottom: '2rem' }}>User Management</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button 
          style={buttonStyle} 
          onClick={handleCreate}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Create User
        </button>
        <button 
          style={buttonStyle} 
          onClick={handleUpdate}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Update User
        </button>
        <button 
          style={buttonStyle} 
          onClick={handleDelete}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Delete User
        </button>
        <button 
          style={buttonStyle} 
          onClick={handleList}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          List Users
        </button>
      </div>
      
      <CreateUserModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onUserCreated={handleUserCreated}
      />
      
      <EditUserModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onUserUpdated={handleUserUpdated}
      />
      
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
};

export default UserManagement;