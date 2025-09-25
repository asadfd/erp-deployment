import React, { useState } from 'react';

const CreateEmployeeModal = ({ isOpen, onClose, onEmployeeCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    passportId: '',
    emiratesId: '',
    phoneNumber: '',
    joiningDate: '',
    endDate: '',
    salary: '',
    comments: ''
  });
  const [joiningDocsFile, setJoiningDocsFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file is ZIP
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setError('Please select a ZIP file for joining documents');
        e.target.value = '';
        return;
      }
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10MB');
        e.target.value = '';
        return;
      }
      setJoiningDocsFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.empId.trim()) {
      setError('Employee ID is required');
      return;
    }
    if (!formData.passportId.trim()) {
      setError('Passport ID is required');
      return;
    }
    if (!formData.emiratesId.trim()) {
      setError('Emirates ID is required');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone Number is required');
      return;
    }
    if (!formData.joiningDate) {
      setError('Joining Date is required');
      return;
    }
    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      setError('Valid salary is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        ...formData,
        salary: parseFloat(formData.salary),
        endDate: formData.endDate || null
      };

      // Create FormData for multipart request
      const formDataToSend = new FormData();
      formDataToSend.append('employeeData', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));
      
      if (joiningDocsFile) {
        formDataToSend.append('joiningDocs', joiningDocsFile);
      }

      const response = await fetch('/api/employee-requests/create', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        onEmployeeCreated(data);
        // Reset form
        setFormData({
          name: '',
          empId: '',
          passportId: '',
          emiratesId: '',
          phoneNumber: '',
          joiningDate: '',
          endDate: '',
          salary: '',
          comments: ''
        });
        setJoiningDocsFile(null);
        setError('');
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Failed to create employee request');
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      empId: '',
      passportId: '',
      emiratesId: '',
      phoneNumber: '',
      joiningDate: '',
      endDate: '',
      salary: '',
      comments: ''
    });
    setJoiningDocsFile(null);
    setError('');
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
    onClose();
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
    width: '600px',
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
        <h3 style={{ marginTop: 0, color: '#333' }}>Create New Employee</h3>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Name *:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Employee ID *:
              </label>
              <input
                type="text"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter employee ID"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Passport ID *:
              </label>
              <input
                type="text"
                name="passportId"
                value={formData.passportId}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter passport ID"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Emirates ID *:
              </label>
              <input
                type="text"
                name="emiratesId"
                value={formData.emiratesId}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter Emirates ID"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Phone Number *:
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter phone number"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Salary *:
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
                placeholder="Enter salary"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
                Joining Date *:
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                style={inputStyle}
                disabled={loading}
              />
            </div>
            
            <div>
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
              placeholder="Enter any additional comments"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px', color: '#333', fontSize: '14px' }}>
              Joining Documents (ZIP file, max 10MB):
            </label>
            <input
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              style={inputStyle}
              disabled={loading}
            />
            {joiningDocsFile && (
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                Selected: {joiningDocsFile.name} ({(joiningDocsFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
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
              {loading ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;