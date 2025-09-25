import React, { useState } from 'react';

const EditEmployeeModal = ({ isOpen, onClose, onEmployeeUpdated }) => {
  const [empId, setEmpId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    endDate: '',
    salary: '',
    comments: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Enter EmpID, 2: Edit Details

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchEmployee = async (e) => {
    e.preventDefault();
    
    if (!empId.trim()) {
      setError('Employee ID is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/employees/${empId.trim()}`, {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        const employee = data.employee;
        setFormData({
          name: employee.name || '',
          phoneNumber: employee.phoneNumber || '',
          endDate: employee.endDate || '',
          salary: employee.salary || '',
          comments: employee.comments || ''
        });
        setStep(2);
        setError('');
      } else {
        setError(data.error || 'Employee not found');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      // Find employee by empId first to get the ID
      const searchResponse = await fetch(`/api/employees/${empId.trim()}`, {
        method: 'GET',
        credentials: 'include'
      });

      const searchData = await searchResponse.json();
      if (!searchData.success) {
        setError('Employee not found');
        setLoading(false);
        return;
      }

      const employeeId = searchData.employee.id;

      const updateData = {
        name: formData.name.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
        endDate: formData.endDate || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        comments: formData.comments.trim() || null
      };

      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        onEmployeeUpdated(data);
        handleClose();
      } else {
        setError(data.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmpId('');
    setFormData({
      name: '',
      phoneNumber: '',
      endDate: '',
      salary: '',
      comments: ''
    });
    setError('');
    setStep(1);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  if (!isOpen) return null;

  const modalStyle = {
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

  const contentStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '500px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '4px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '0 4px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#6c757d',
    color: 'white'
  };

  return (
    <div style={modalStyle} onClick={handleClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Edit Employee</h3>
        
        {step === 1 ? (
          <form onSubmit={handleSearchEmployee}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333' }}>
                Employee ID:
              </label>
              <input
                type="text"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                style={inputStyle}
                placeholder="Enter employee ID to edit"
                disabled={loading}
              />
            </div>

            {error && (
              <div style={{
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '1.5rem' 
            }}>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={primaryButtonStyle}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Find Employee'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUpdateEmployee}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Name:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter new name (leave empty to keep current)"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Phone Number:
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter new phone number"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Salary:
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter new salary"
                min="0"
                step="0.01"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                End Date:
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Comments:
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
                disabled={loading}
                placeholder="Enter updated comments"
              />
            </div>

            {error && (
              <div style={{
                color: '#dc3545',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                padding: '8px 12px',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '1.5rem' 
            }}>
              <button
                type="button"
                style={secondaryButtonStyle}
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={primaryButtonStyle}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Employee'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditEmployeeModal;