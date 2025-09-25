import React, { useState, useEffect } from 'react';

const EmployeeAssignment = ({ projectId, onEmployeesAssigned }) => {
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [roleInProject, setRoleInProject] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAvailableEmployees();
        fetchAssignedEmployees();
    }, [projectId]);

    const fetchAvailableEmployees = async () => {
        try {
            const response = await fetch('/api/projects/employees', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setAvailableEmployees(data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const fetchAssignedEmployees = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/employees`, {
                credentials: 'include'
            });
            console.error('response fetching employees:', response);
            if (response.ok) {
                const data = await response.json();
                setAssignedEmployees(data);
                onEmployeesAssigned(data);
            }
        } catch (error) {
            console.error('Error fetching assigned employees:', error);
        }
    };

    const handleAssignEmployee = async () => {
        if (!selectedEmployeeId) {
            alert('Please select an employee');
            return;
        }

        setLoading(true);
        
        const selectedEmployee = availableEmployees.find(emp => emp.id == selectedEmployeeId);
        if (!selectedEmployee) {
            alert('Selected employee not found');
            setLoading(false);
            return;
        }

        const newAssignment = {
            id: Date.now(),
            employee: selectedEmployee,
            assignedDate: new Date().toISOString(),
            roleInProject: roleInProject
        };

        setAssignedEmployees(prev => [...prev, newAssignment]);
        onEmployeesAssigned([...assignedEmployees, newAssignment]);

        try {
            const url = `/api/projects/${projectId}/employees/${selectedEmployeeId}${roleInProject ? `?roleInProject=${encodeURIComponent(roleInProject)}` : ''}`;
            const response = await fetch(url, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                const savedAssignment = await response.json();
                setAssignedEmployees(prev => 
                    prev.map(assignment => 
                        assignment.id === newAssignment.id ? savedAssignment : assignment
                    )
                );
                onEmployeesAssigned(assignedEmployees.map(assignment => 
                    assignment.id === newAssignment.id ? savedAssignment : assignment
                ));
                setSelectedEmployeeId('');
                setRoleInProject('');
                alert('Employee assigned successfully');
            } else {
                setAssignedEmployees(prev => prev.filter(assignment => assignment.id !== newAssignment.id));
                onEmployeesAssigned(assignedEmployees.filter(assignment => assignment.id !== newAssignment.id));
                alert('Failed to assign employee');
            }
        } catch (error) {
            console.error('Error assigning employee:', error);
            setAssignedEmployees(prev => prev.filter(assignment => assignment.id !== newAssignment.id));
            onEmployeesAssigned(assignedEmployees.filter(assignment => assignment.id !== newAssignment.id));
            alert('Error assigning employee');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveEmployee = async (employeeId) => {
        if (window.confirm('Are you sure you want to remove this employee from the project?')) {
            const removedEmployee = assignedEmployees.find(pe => pe.employee.id === employeeId);
            if (!removedEmployee) return;

            const updatedAssignments = assignedEmployees.filter(pe => pe.employee.id !== employeeId);
            setAssignedEmployees(updatedAssignments);
            onEmployeesAssigned(updatedAssignments);

            try {
                const response = await fetch(`/api/projects/${projectId}/employees/${employeeId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('Employee removed successfully');
                } else {
                    setAssignedEmployees(prev => [...prev, removedEmployee]);
                    onEmployeesAssigned([...updatedAssignments, removedEmployee]);
                    alert('Failed to remove employee');
                }
            } catch (error) {
                console.error('Error removing employee:', error);
                setAssignedEmployees(prev => [...prev, removedEmployee]);
                onEmployeesAssigned([...updatedAssignments, removedEmployee]);
                alert('Error removing employee');
            }
        }
    };

    const getUnassignedEmployees = () => {
        const assignedIds = assignedEmployees.map(pe => pe.employee.id);
        return availableEmployees.filter(emp => !assignedIds.includes(emp.id));
    };

    // Notify parent whenever assigned employees change
    useEffect(() => {
        onEmployeesAssigned(assignedEmployees);
    }, [assignedEmployees, onEmployeesAssigned]);

    const containerStyle = {
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px'
    };

    const sectionStyle = {
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    };

    const titleStyle = {
        margin: '0 0 20px 0',
        color: '#333',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px'
    };

    const formRowStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '15px'
    };

    const formGroupStyle = {
        display: 'flex',
        flexDirection: 'column'
    };

    const labelStyle = {
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#333',
        fontSize: '14px'
    };

    const inputStyle = {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
        boxSizing: 'border-box'
    };

    const buttonStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#007bff',
        color: 'white'
    };

    const successButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#28a745',
        color: 'white'
    };

    const dangerButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#dc3545',
        color: 'white'
    };

    const employeeCardStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        marginBottom: '10px'
    };

    const employeeInfoStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
    };

    const noEmployeesStyle = {
        textAlign: 'center',
        color: '#6c757d',
        fontStyle: 'italic',
        padding: '20px'
    };


    return (
        <div style={containerStyle}>
            <div style={sectionStyle}>
                <h4 style={titleStyle}>Assign Existing Employees</h4>
                <div style={formRowStyle}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Select Employee</label>
                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            disabled={loading}
                            style={inputStyle}
                        >
                            <option value="">Choose an employee</option>
                            {getUnassignedEmployees().map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.empId})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Role in Project (Optional)</label>
                        <input
                            type="text"
                            value={roleInProject}
                            onChange={(e) => setRoleInProject(e.target.value)}
                            placeholder="e.g., Developer, Tester, Manager"
                            disabled={loading}
                            style={inputStyle}
                        />
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleAssignEmployee}
                        disabled={loading || !selectedEmployeeId}
                        style={{
                            ...successButtonStyle,
                            backgroundColor: loading || !selectedEmployeeId ? '#6c757d' : '#28a745',
                            cursor: loading || !selectedEmployeeId ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Assigning...' : 'Assign Employee'}
                    </button>
                </div>
            </div>

            <div style={sectionStyle}>
                <h4 style={titleStyle}>Assigned Employees ({assignedEmployees.length})</h4>
                {assignedEmployees.length === 0 ? (
                    <p style={noEmployeesStyle}>No employees assigned yet</p>
                ) : (
                    <div>
                        {assignedEmployees.map(pe => (
                            <div key={pe.id} style={employeeCardStyle}>
                                <div style={employeeInfoStyle}>
                                    <strong style={{ fontSize: '16px', color: '#333' }}>{pe.employee.name}</strong>
                                    <span style={{ fontSize: '14px', color: '#6c757d' }}>ID: {pe.employee.empId}</span>
                                    {pe.roleInProject && (
                                        <span style={{ fontSize: '14px', color: '#007bff', fontWeight: '500' }}>Role: {pe.roleInProject}</span>
                                    )}
                                    <span style={{ fontSize: '14px', color: '#6c757d' }}>
                                        Assigned: {new Date(pe.assignedDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleRemoveEmployee(pe.employee.id)}
                                    style={dangerButtonStyle}
                                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default EmployeeAssignment;