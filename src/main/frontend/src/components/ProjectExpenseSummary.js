import React, { useState, useEffect } from 'react';

const ProjectExpenseSummary = ({ projectId }) => {
    const [expenseData, setExpenseData] = useState(null);
    const [expenseBreakdown, setExpenseBreakdown] = useState(null);
    const [project, setProject] = useState(null);
    const [dailyStats, setDailyStats] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchExpenseData();
        }
    }, [projectId]);

    const fetchExpenseData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchProjectDetails(),
                fetchProjectExpense(),
                fetchExpenseBreakdown(),
                fetchDailyStatistics()
            ]);
        } catch (error) {
            console.error('Error fetching expense data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectDetails = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProject(data);
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
        }
    };

    const fetchProjectExpense = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/expense`, {
                credentials: 'include'
            });
            if (response.ok) {
                const totalExpense = await response.json();
                setExpenseData({ totalExpense });
            }
        } catch (error) {
            console.error('Error fetching project expense:', error);
        }
    };

    const fetchExpenseBreakdown = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/expense/breakdown`, {
                credentials: 'include'
            });
            if (response.ok) {
                const breakdown = await response.json();
                setExpenseBreakdown(breakdown);
            }
        } catch (error) {
            console.error('Error fetching expense breakdown:', error);
        }
    };

    const fetchDailyStatistics = async () => {
        if (!project) return;
        
        try {
            const start = new Date(project.startDate || Date.now());
            const end = new Date(project.endDate || Date.now());
            const today = new Date();
            const actualEnd = end > today ? today : end;
            
            const stats = [];
            for (let date = new Date(start); date <= actualEnd; date.setDate(date.getDate() + 1)) {
                const dateStr = date.toISOString().split('T')[0];
                const response = await fetch(`/api/projects/${projectId}/stats/date/${dateStr}`, {
                    credentials: 'include'
                });
                
                if (response.ok) {
                    const dailyStat = await response.json();
                    if (dailyStat.employeeCount > 0 || dailyStat.totalHours > 0) {
                        stats.push(dailyStat);
                    }
                }
            }
            
            setDailyStats(stats);
        } catch (error) {
            console.error('Error fetching daily statistics:', error);
        }
    };

    const calculateDailyExpense = (date, employeeCount, totalHours) => {
        if (!project) return 0;
        
        if (project.perHourRate && totalHours) {
            return totalHours * project.perHourRate;
        }
        
        if (project.perDayRate && employeeCount) {
            return employeeCount * project.perDayRate;
        }
        
        return 0;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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

    const loadingStyle = {
        textAlign: 'center',
        color: '#6c757d',
        fontStyle: 'italic',
        padding: '40px'
    };

    const noDataStyle = {
        textAlign: 'center',
        color: '#6c757d',
        fontStyle: 'italic',
        padding: '40px',
        background: '#f8f9fa',
        borderRadius: '8px'
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <h4 style={titleStyle}>Project Expense Summary</h4>
                <div style={loadingStyle}>Loading expense data...</div>
            </div>
        );
    }

    if (!project || !expenseData) {
        return (
            <div style={containerStyle}>
                <h4 style={titleStyle}>Project Expense Summary</h4>
                <div style={noDataStyle}>No expense data available</div>
            </div>
        );
    }

    const totalDailyExpenses = dailyStats.reduce((total, stat) => {
        return total + calculateDailyExpense(stat.date, stat.employeeCount, stat.totalHours);
    }, 0);

    const summaryCardsStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    };

    const summaryCardStyle = {
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
    };

    const cardHeaderStyle = {
        marginBottom: '15px'
    };

    const cardTitleStyle = {
        margin: '0',
        color: '#333',
        fontSize: '16px',
        fontWeight: 'bold'
    };

    const cardValueStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: '10px'
    };

    const cardSubtitleStyle = {
        color: '#6c757d',
        fontSize: '14px',
        margin: '0'
    };

    return (
        <div style={containerStyle}>
            <h4 style={titleStyle}>Project Expense Summary</h4>
            
            <div style={summaryCardsStyle}>
                <div style={summaryCardStyle}>
                    <div style={cardHeaderStyle}>
                        <h5 style={cardTitleStyle}>Project Budget</h5>
                    </div>
                    <div style={cardValueStyle}>
                        {formatCurrency(project.projectBudget)}
                    </div>
                    <div style={cardSubtitleStyle}>Total Allocated Budget</div>
                </div>
                
                <div style={summaryCardStyle}>
                    <div style={cardHeaderStyle}>
                        <h5 style={cardTitleStyle}>Total Expenses</h5>
                    </div>
                    <div style={{...cardValueStyle, color: '#dc3545'}}>
                        {formatCurrency(expenseData.totalExpense)}
                    </div>
                    <div style={cardSubtitleStyle}>Actual Expenses Incurred</div>
                </div>
                
                <div style={summaryCardStyle}>
                    <div style={cardHeaderStyle}>
                        <h5 style={cardTitleStyle}>Remaining Budget</h5>
                    </div>
                    <div style={{...cardValueStyle, color: '#28a745'}}>
                        {formatCurrency((project.projectBudget || 0) - (expenseData.totalExpense || 0))}
                    </div>
                    <div style={cardSubtitleStyle}>
                        {project.projectBudget ? 
                            `${(((project.projectBudget - expenseData.totalExpense) / project.projectBudget) * 100).toFixed(1)}% remaining` :
                            'No budget set'
                        }
                    </div>
                </div>
            </div>

            {expenseBreakdown && (
                <div style={{marginBottom: '30px'}}>
                    <h5 style={{margin: '0 0 20px 0', color: '#333'}}>Expense Breakdown</h5>
                    
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px'}}>
                        <div style={{background: '#e3f2fd', padding: '15px', borderRadius: '8px', border: '1px solid #1976d2'}}>
                            <h6 style={{margin: '0 0 10px 0', color: '#1976d2', fontSize: '14px'}}>Employee Expenses</h6>
                            <div style={{fontSize: '18px', fontWeight: 'bold', color: '#1976d2'}}>
                                {formatCurrency(expenseBreakdown.employeeExpenses)}
                            </div>
                        </div>
                        
                        <div style={{background: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50'}}>
                            <h6 style={{margin: '0 0 10px 0', color: '#4caf50', fontSize: '14px'}}>Inventory Expenses</h6>
                            <div style={{fontSize: '18px', fontWeight: 'bold', color: '#4caf50'}}>
                                {formatCurrency(expenseBreakdown.inventoryExpenses)}
                            </div>
                        </div>
                        
                        <div style={{background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ff9800'}}>
                            <h6 style={{margin: '0 0 10px 0', color: '#ff9800', fontSize: '14px'}}>Other Expenses</h6>
                            <div style={{fontSize: '18px', fontWeight: 'bold', color: '#ff9800'}}>
                                {formatCurrency(expenseBreakdown.otherExpenses)}
                            </div>
                        </div>
                    </div>
                    
                    {expenseBreakdown.employeeExpenseDetails && expenseBreakdown.employeeExpenseDetails.length > 0 && (
                        <div>
                            <h6 style={{margin: '0 0 15px 0', color: '#333'}}>Employee Expense Details</h6>
                            <div style={{border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden'}}>
                                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr style={{backgroundColor: '#f8f9fa'}}>
                                            <th style={{padding: '12px', border: '1px solid #ddd', textAlign: 'left'}}>Employee</th>
                                            <th style={{padding: '12px', border: '1px solid #ddd', textAlign: 'center'}}>Emp ID</th>
                                            <th style={{padding: '12px', border: '1px solid #ddd', textAlign: 'center'}}>Total Hours</th>
                                            <th style={{padding: '12px', border: '1px solid #ddd', textAlign: 'center'}}>Days Worked</th>
                                            <th style={{padding: '12px', border: '1px solid #ddd', textAlign: 'right'}}>Total Expense</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenseBreakdown.employeeExpenseDetails.map((emp, index) => (
                                            <tr key={index} style={{backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'}}>
                                                <td style={{padding: '10px', border: '1px solid #ddd'}}>{emp.employeeName}</td>
                                                <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center'}}>{emp.empId}</td>
                                                <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center'}}>{emp.totalHours?.toFixed(1) || '0.0'}</td>
                                                <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center'}}>{emp.totalDaysWorked || 0}</td>
                                                <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold'}}>{formatCurrency(emp.totalExpense)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px', borderLeft: '4px solid #17a2b8'}}>
                <h5 style={{margin: '0 0 15px 0', color: '#333'}}>Rate Configuration</h5>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {project.perHourRate && (
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{color: '#333', fontWeight: '500'}}>Hourly Rate:</span>
                            <span style={{color: '#007bff', fontWeight: 'bold'}}>{formatCurrency(project.perHourRate)}</span>
                        </div>
                    )}
                    {project.perDayRate && (
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{color: '#333', fontWeight: '500'}}>Daily Rate:</span>
                            <span style={{color: '#007bff', fontWeight: 'bold'}}>{formatCurrency(project.perDayRate)}</span>
                        </div>
                    )}
                </div>
            </div>

            {dailyStats.length > 0 && (
                <div style={{marginBottom: '30px'}}>
                    <h5 style={{margin: '0 0 15px 0', color: '#333'}}>Daily Work & Expense Breakdown</h5>
                    <div style={{border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden'}}>
                        <div style={{overflowX: 'auto'}}>
                            <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '600px'}}>
                                <thead>
                                    <tr>
                                        <th style={{background: '#343a40', color: 'white', padding: '12px', border: '1px solid #ddd', textAlign: 'left'}}>Date</th>
                                        <th style={{background: '#343a40', color: 'white', padding: '12px', border: '1px solid #ddd', textAlign: 'center'}}>Employees</th>
                                        <th style={{background: '#343a40', color: 'white', padding: '12px', border: '1px solid #ddd', textAlign: 'center'}}>Total Hours</th>
                                        <th style={{background: '#343a40', color: 'white', padding: '12px', border: '1px solid #ddd', textAlign: 'center'}}>Daily Expense</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dailyStats.map((stat, index) => {
                                        const dailyExpense = calculateDailyExpense(stat.date, stat.employeeCount, stat.totalHours);
                                        return (
                                            <tr key={index} style={{backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa'}}>
                                                <td style={{padding: '12px', border: '1px solid #ddd'}}>{formatDate(stat.date)}</td>
                                                <td style={{padding: '12px', border: '1px solid #ddd', textAlign: 'center'}}>{stat.employeeCount}</td>
                                                <td style={{padding: '12px', border: '1px solid #ddd', textAlign: 'center'}}>{stat.totalHours ? stat.totalHours.toFixed(1) : '0.0'}</td>
                                                <td style={{padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#007bff'}}>{formatCurrency(dailyExpense)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr style={{backgroundColor: '#d4edda'}}>
                                        <th style={{padding: '12px', border: '1px solid #ddd', color: '#155724', fontWeight: 'bold'}}>Totals</th>
                                        <th style={{padding: '12px', border: '1px solid #ddd', color: '#155724', fontWeight: 'bold', textAlign: 'center'}}>{dailyStats.reduce((sum, stat) => sum + (stat.employeeCount || 0), 0)} total work days</th>
                                        <th style={{padding: '12px', border: '1px solid #ddd', color: '#155724', fontWeight: 'bold', textAlign: 'center'}}>{dailyStats.reduce((sum, stat) => sum + (stat.totalHours || 0), 0).toFixed(1)}</th>
                                        <th style={{padding: '12px', border: '1px solid #ddd', color: '#155724', fontWeight: 'bold', textAlign: 'center', fontSize: '16px'}}>{formatCurrency(totalDailyExpenses)}</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <div style={{background: '#fff3cd', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ffc107'}}>
                <h5 style={{margin: '0 0 15px 0', color: '#856404'}}>Calculation Notes</h5>
                <ul style={{margin: '0', paddingLeft: '20px', color: '#856404'}}>
                    <li style={{marginBottom: '8px'}}>Expenses are calculated based on actual hours worked and configured rates</li>
                    <li style={{marginBottom: '8px'}}>If hourly rate is set, expense = hours × hourly rate</li>
                    <li style={{marginBottom: '8px'}}>If only daily rate is set, expense = employees working × daily rate</li>
                    <li style={{marginBottom: '0'}}>Budget tracking shows remaining allocation vs actual expenses</li>
                </ul>
            </div>
        </div>
    );
};

export default ProjectExpenseSummary;