import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployeeHoursReport.css';

const EmployeeHoursReport = () => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedEmployees, setExpandedEmployees] = useState(new Set());

    const fetchEmployeeHoursReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/reports/employee-hours?startDate=${startDate}&endDate=${endDate}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch employee hours report');
            }
            
            const data = await response.json();
            setEmployeeData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeHoursReport();
    }, []);

    const handleDateChange = () => {
        fetchEmployeeHoursReport();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    const formatHours = (hours) => {
        return parseFloat(hours || 0).toFixed(2);
    };

    const toggleEmployeeDetails = (employeeId) => {
        const newExpanded = new Set(expandedEmployees);
        if (newExpanded.has(employeeId)) {
            newExpanded.delete(employeeId);
        } else {
            newExpanded.add(employeeId);
        }
        setExpandedEmployees(newExpanded);
    };

    return (
        <div className="employee-hours-report">
            <div className="report-header">
                <h2>Employee Hours & Billing Report</h2>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="back-btn"
                >
                    Back to Dashboard
                </button>
            </div>
            
            <div className="date-filters">
                <div className="date-input">
                    <label>Start Date:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="date-input">
                    <label>End Date:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <button onClick={handleDateChange} className="filter-btn">
                    Apply Filter
                </button>
            </div>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">Error: {error}</div>}

            {employeeData && employeeData.employeeSummaries && (
                <div className="report-content">
                    <h3>Employee Work Summary</h3>
                    {employeeData.employeeSummaries.length === 0 ? (
                        <p>No employee hours data found for the selected date range.</p>
                    ) : (
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Employee Name</th>
                                    <th>Employee Code</th>
                                    <th>Total Hours</th>
                                    <th>Total Days</th>
                                    <th>Total Amount</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeData.employeeSummaries.map((employee) => (
                                    <React.Fragment key={employee.employeeId}>
                                        <tr>
                                            <td>{employee.employeeId}</td>
                                            <td>{employee.employeeName}</td>
                                            <td>{employee.empId}</td>
                                            <td>{formatHours(employee.totalHours)}</td>
                                            <td>{(employee.totalHours / 8).toFixed(1)}</td>
                                            <td className="amount">{formatCurrency(employee.totalAmount)}</td>
                                            <td>
                                                <button 
                                                    className="details-btn"
                                                    onClick={() => toggleEmployeeDetails(employee.employeeId)}
                                                >
                                                    {expandedEmployees.has(employee.employeeId) ? 'Hide' : 'View'} Projects
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedEmployees.has(employee.employeeId) && (
                                            <tr className="details-row">
                                                <td colSpan="7">
                                                    <div className="project-details">
                                                        <h4>Project Assignment Details</h4>
                                                        <table className="sub-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Project ID</th>
                                                                    <th>Project Description</th>
                                                                    <th>Hours Worked</th>
                                                                    <th>Days Worked</th>
                                                                    <th>Daily Rate</th>
                                                                    <th>Hourly Rate</th>
                                                                    <th>Total Amount</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {employee.projectDetails && employee.projectDetails.map((project) => (
                                                                    <tr key={project.projectId}>
                                                                        <td>{project.projectId}</td>
                                                                        <td>{project.projectDescription}</td>
                                                                        <td>{formatHours(project.hoursWorked)}</td>
                                                                        <td>{project.daysWorked}</td>
                                                                        <td>{formatCurrency(project.dailyRate)}</td>
                                                                        <td>{formatCurrency(project.hourlyRate)}</td>
                                                                        <td className="amount">{formatCurrency(project.totalAmount)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className="sub-total-row">
                                                                    <td colSpan="2"><strong>Project Totals</strong></td>
                                                                    <td><strong>{formatHours(employee.totalHours)}</strong></td>
                                                                    <td><strong>{(employee.totalHours / 8).toFixed(1)}</strong></td>
                                                                    <td colSpan="2"></td>
                                                                    <td className="amount"><strong>{formatCurrency(employee.totalAmount)}</strong></td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan="3"><strong>Grand Total</strong></td>
                                    <td>
                                        <strong>
                                            {formatHours(
                                                employeeData.employeeSummaries.reduce((sum, e) => sum + parseFloat(e.totalHours || 0), 0)
                                            )}
                                        </strong>
                                    </td>
                                    <td>
                                        <strong>
                                            {(employeeData.employeeSummaries.reduce((sum, e) => sum + parseFloat(e.totalHours || 0), 0) / 8).toFixed(1)}
                                        </strong>
                                    </td>
                                    <td className="amount">
                                        <strong>
                                            {formatCurrency(
                                                employeeData.employeeSummaries.reduce((sum, e) => sum + parseFloat(e.totalAmount || 0), 0)
                                            )}
                                        </strong>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default EmployeeHoursReport;