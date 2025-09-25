import React, { useState } from 'react';
import CreateEmployeeModal from './CreateEmployeeModal';
import EditEmployeeModal from './EditEmployeeModal';
import DeleteEmployeeModal from './DeleteEmployeeModal';
import EmployeeList from './EmployeeList';

const EmployeeManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEmployeeList, setShowEmployeeList] = useState(false);

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

  const handleEmployeeCreated = (employeeData) => {
    console.log('Employee request created successfully:', employeeData);
    alert(employeeData.message || 'Employee request submitted successfully and sent for approval');
    setShowCreateModal(false);
  };

  const handleEmployeeUpdated = (employeeData) => {
    console.log('Employee updated successfully:', employeeData);
    setShowEditModal(false);
    setShowEmployeeList(true);
  };

  const handleEmployeeDeleted = (employeeData) => {
    console.log('Employee deleted successfully:', employeeData);
    setShowDeleteModal(false);
    setShowEmployeeList(true);
  };

  const handleUpdate = () => {
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleList = () => {
    setShowEmployeeList(true);
  };

  const handleBackToManagement = () => {
    setShowEmployeeList(false);
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

  if (showEmployeeList) {
    return <EmployeeList onBack={handleBackToManagement} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#333', marginBottom: '2rem' }}>Employee Management</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button 
          style={buttonStyle} 
          onClick={handleCreate}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Create Employee
        </button>
        <button 
          style={buttonStyle} 
          onClick={handleUpdate}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Update Employee
        </button>
        <button 
          style={buttonStyle} 
          onClick={handleDelete}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Delete Employee
        </button>
        <button 
          style={buttonStyle} 
          onClick={handleList}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          List Employees
        </button>
      </div>
      
      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onEmployeeCreated={handleEmployeeCreated}
      />
      
      <EditEmployeeModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onEmployeeUpdated={handleEmployeeUpdated}
      />
      
      <DeleteEmployeeModal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onEmployeeDeleted={handleEmployeeDeleted}
      />
    </div>
  );
};

export default EmployeeManagement;