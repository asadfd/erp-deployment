import React, { useState, useEffect } from 'react';

const TimesheetMatrix = ({ projectId, startDate, endDate, assignedEmployees }) => {
    const [timesheetData, setTimesheetData] = useState({});
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([]);

    useEffect(() => {
        if (startDate && endDate) {
            generateDateRange();
            fetchTimesheetData();
        }
    }, [projectId, startDate, endDate, assignedEmployees]);

    const generateDateRange = () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates = [];
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            dates.push(new Date(date));
        }
        
        setDateRange(dates);
    };

    const fetchTimesheetData = async () => {
        if (!projectId || !startDate || !endDate) return;
        
        try {
            const response = await fetch(`/api/projects/${projectId}/timesheet/range?startDate=${startDate}&endDate=${endDate}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                const timesheetMap = {};
                
                data.forEach(timesheet => {
                    const key = `${timesheet.employee.id}-${timesheet.workDate}`;
                    timesheetMap[key] = timesheet.hoursWorked;
                });
                
                setTimesheetData(timesheetMap);
            }
        } catch (error) {
            console.error('Error fetching timesheet data:', error);
        }
    };

    const handleHoursChange = async (employeeId, date, hours) => {
        const dateStr = date.toISOString().split('T')[0];
        const key = `${employeeId}-${dateStr}`;
        
        if (!isDateEditable(date)) {
            alert('This date is not editable. Timesheets can only be edited between project start date and today.');
            return;
        }
        
        setTimesheetData(prev => ({
            ...prev,
            [key]: hours
        }));

        try {
            const response = await fetch(`/api/projects/${projectId}/timesheet?employeeId=${employeeId}&workDate=${dateStr}&hoursWorked=${hours}`, {
                method: 'POST',
                credentials: 'include'
            });
            
            if (!response.ok) {
                alert('Failed to save timesheet data');
                fetchTimesheetData();
            }
        } catch (error) {
            console.error('Error saving timesheet:', error);
            alert('Error saving timesheet data');
            fetchTimesheetData();
        }
    };

    const isDateEditable = (date) => {
        const today = new Date();
        const projectStart = new Date(startDate);
        const projectEnd = new Date(endDate);
        
        today.setHours(23, 59, 59, 999);
        
        return date >= projectStart && date <= projectEnd && date <= today;
    };

    const formatDate = (date) => {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    const getTimesheetValue = (employeeId, date) => {
        const dateStr = date.toISOString().split('T')[0];
        const key = `${employeeId}-${dateStr}`;
        return timesheetData[key] || '';
    };

    const containerStyle = {
        padding: '20px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
    };

    const titleStyle = {
        margin: '0 0 20px 0',
        color: '#333',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px'
    };

    const matrixInfoStyle = {
        background: '#f8f9fa',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        borderLeft: '4px solid #007bff'
    };

    const noDataStyle = {
        textAlign: 'center',
        color: '#6c757d',
        fontStyle: 'italic',
        padding: '40px',
        background: '#f8f9fa',
        borderRadius: '8px'
    };

    const matrixContainerStyle = {
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden'
    };

    const matrixScrollStyle = {
        overflowX: 'auto',
        maxWidth: '100%'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px'
    };

    const employeeHeaderStyle = {
        background: '#343a40',
        color: 'white',
        minWidth: '150px',
        textAlign: 'left',
        position: 'sticky',
        left: 0,
        zIndex: 2,
        border: '1px solid #ddd',
        padding: '8px'
    };

    const dateHeaderStyle = {
        background: '#007bff',
        color: 'white',
        minWidth: '80px',
        whiteSpace: 'nowrap',
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'center'
    };

    const nonEditableDateHeaderStyle = {
        ...dateHeaderStyle,
        background: '#6c757d'
    };

    const totalHeaderStyle = {
        background: '#28a745',
        color: 'white',
        minWidth: '100px',
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'center'
    };

    const employeeCellStyle = {
        background: '#f8f9fa',
        textAlign: 'left',
        position: 'sticky',
        left: 0,
        zIndex: 1,
        minWidth: '150px',
        border: '1px solid #ddd',
        padding: '8px'
    };

    const hoursCellStyle = {
        background: 'white',
        padding: '4px',
        border: '1px solid #ddd',
        textAlign: 'center'
    };

    const nonEditableHoursCellStyle = {
        ...hoursCellStyle,
        background: '#f5f5f5'
    };

    const hoursInputStyle = {
        width: '60px',
        padding: '4px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        textAlign: 'center',
        fontSize: '12px'
    };

    const totalCellStyle = {
        background: '#d4edda',
        color: '#155724',
        fontWeight: 'bold',
        border: '1px solid #ddd',
        padding: '8px',
        textAlign: 'center'
    };

    if (!assignedEmployees || assignedEmployees.length === 0) {
        return (
            <div style={containerStyle}>
                <p style={noDataStyle}>No employees assigned to this project yet.</p>
            </div>
        );
    }

    if (dateRange.length === 0) {
        return (
            <div style={containerStyle}>
                <p style={noDataStyle}>Invalid date range.</p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h4 style={titleStyle}>Daily Timesheet Matrix</h4>
            <div style={matrixInfoStyle}>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Project Duration:</strong> {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</p>
                <p style={{ margin: '5px 0', color: '#333' }}><strong>Assigned Employees:</strong> {assignedEmployees.length}</p>
                <p style={{ margin: '5px 0' }}><small style={{ color: '#6c757d' }}><em>* Only dates between project start date and today are editable</em></small></p>
            </div>
            
            <div style={matrixContainerStyle}>
                <div style={matrixScrollStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={employeeHeaderStyle}>Employee</th>
                                {dateRange.map((date, index) => (
                                    <th key={index} style={isDateEditable(date) ? dateHeaderStyle : nonEditableDateHeaderStyle}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{formatDate(date)}</div>
                                            <div style={{ fontSize: '10px', opacity: '0.9' }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                        </div>
                                    </th>
                                ))}
                                <th style={totalHeaderStyle}>Total Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignedEmployees.map(projectEmployee => {
                                const employee = projectEmployee.employee;
                                const totalHours = dateRange.reduce((total, date) => {
                                    const hours = parseFloat(getTimesheetValue(employee.id, date)) || 0;
                                    return total + hours;
                                }, 0);
                                
                                return (
                                    <tr key={employee.id}>
                                        <td style={employeeCellStyle}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <strong style={{ color: '#333', fontSize: '14px' }}>{employee.name}</strong>
                                                <span style={{ color: '#6c757d', fontSize: '12px' }}>({employee.empId})</span>
                                                {projectEmployee.roleInProject && (
                                                    <span style={{ color: '#007bff', fontSize: '11px', fontWeight: '500' }}>{projectEmployee.roleInProject}</span>
                                                )}
                                            </div>
                                        </td>
                                        {dateRange.map((date, dateIndex) => {
                                            const isEditable = isDateEditable(date);
                                            const hours = getTimesheetValue(employee.id, date);
                                            
                                            return (
                                                <td key={dateIndex} style={isEditable ? hoursCellStyle : nonEditableHoursCellStyle}>
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        min="0"
                                                        max="24"
                                                        value={hours}
                                                        onChange={(e) => handleHoursChange(employee.id, date, e.target.value)}
                                                        disabled={!isEditable}
                                                        style={{
                                                            ...hoursInputStyle,
                                                            backgroundColor: !isEditable ? '#e9ecef' : 'white',
                                                            cursor: !isEditable ? 'not-allowed' : 'text'
                                                        }}
                                                        placeholder="0"
                                                    />
                                                </td>
                                            );
                                        })}
                                        <td style={totalCellStyle}>
                                            <strong>{totalHours.toFixed(1)}</strong>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th style={{ background: '#d1ecf1', color: '#0c5460', fontWeight: 'bold', border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Daily Totals</th>
                                {dateRange.map((date, dateIndex) => {
                                    const dailyTotal = assignedEmployees.reduce((total, pe) => {
                                        const hours = parseFloat(getTimesheetValue(pe.employee.id, date)) || 0;
                                        return total + hours;
                                    }, 0);
                                    
                                    return (
                                        <th key={dateIndex} style={{ background: '#d1ecf1', color: '#0c5460', fontWeight: 'bold', fontSize: '14px', border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                            {dailyTotal.toFixed(1)}
                                        </th>
                                    );
                                })}
                                <th style={{ background: '#d4edda', color: '#155724', fontSize: '16px', fontWeight: 'bold', border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                                    {assignedEmployees.reduce((grandTotal, pe) => {
                                        const employeeTotal = dateRange.reduce((empTotal, date) => {
                                            const hours = parseFloat(getTimesheetValue(pe.employee.id, date)) || 0;
                                            return empTotal + hours;
                                        }, 0);
                                        return grandTotal + employeeTotal;
                                    }, 0).toFixed(1)}
                                </th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TimesheetMatrix;