import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmployeeList = ({ onBack }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/employees/list');
      if (response.data.success) {
        setEmployees(response.data.employees);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatSalary = (salary) => {
    if (!salary) return 'N/A';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2
    }).format(salary);
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
    padding: '12px 8px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontSize: '12px'
  };

  const tdStyle = {
    padding: '8px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '12px',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading employees...</p>
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
          Back to Employee Management
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
        <h2 style={{ color: '#333', margin: 0 }}>Employee List</h2>
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
          Back to Employee Management
        </button>
      </div>

      {employees.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No employees found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Emp ID</th>
                <th style={thStyle}>Passport ID</th>
                <th style={thStyle}>Emirates ID</th>
                <th style={thStyle}>Phone</th>
                <th style={thStyle}>Joining Date</th>
                <th style={thStyle}>End Date</th>
                <th style={thStyle}>Salary</th>
                <th style={thStyle}>Joining Docs</th>
                <th style={thStyle}>Comments</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} style={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                  <td style={tdStyle} title={employee.name}>{employee.name}</td>
                  <td style={tdStyle} title={employee.empId}>{employee.empId}</td>
                  <td style={tdStyle} title={employee.passportId}>{employee.passportId}</td>
                  <td style={tdStyle} title={employee.emiratesId}>{employee.emiratesId}</td>
                  <td style={tdStyle} title={employee.phoneNumber}>{employee.phoneNumber}</td>
                  <td style={tdStyle} title={formatDate(employee.joiningDate)}>{formatDate(employee.joiningDate)}</td>
                  <td style={tdStyle} title={formatDate(employee.endDate)}>{formatDate(employee.endDate)}</td>
                  <td style={tdStyle} title={formatSalary(employee.salary)}>{formatSalary(employee.salary)}</td>
                  <td style={tdStyle}>
                    {employee.joiningDocsPath ? (
                      <a 
                        href={`/api/employee-requests/download-docs/${employee.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#007bff',
                          textDecoration: 'underline',
                          fontSize: '11px'
                        }}
                      >
                        Download
                      </a>
                    ) : (
                      <span style={{ color: '#666', fontSize: '11px' }}>No docs</span>
                    )}
                  </td>
                  <td style={{...tdStyle, maxWidth: '200px'}} title={employee.comments || 'N/A'}>
                    {employee.comments || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        Total employees: {employees.length}
      </div>
    </div>
  );
};

export default EmployeeList;