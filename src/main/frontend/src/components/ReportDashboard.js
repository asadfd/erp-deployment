import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportDashboard.css';

const ReportDashboard = () => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [cashFlowData, setCashFlowData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCashFlowReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/reports/cashflow?startDate=${startDate}&endDate=${endDate}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch cash flow report');
            }
            
            const data = await response.json();
            setCashFlowData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCashFlowReport();
    }, []);

    const handleDateChange = () => {
        fetchCashFlowReport();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };

    return (
        <div className="report-dashboard">
            <div className="report-header">
                <h2>Cash Flow Report</h2>
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

            {cashFlowData && cashFlowData.projectSummaries && (
                <div className="report-content">
                    <h3>Project Cash Flow Summary</h3>
                    {cashFlowData.projectSummaries.length === 0 ? (
                        <p>No cash flow data found for the selected date range.</p>
                    ) : (
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Project ID</th>
                                    <th>Project Description</th>
                                    <th>Total Inflow</th>
                                    <th>Total Outflow</th>
                                    <th>Net Cash Flow</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cashFlowData.projectSummaries.map((project) => (
                                    <React.Fragment key={project.projectId}>
                                        <tr>
                                            <td>{project.projectId}</td>
                                            <td>{project.projectDescription}</td>
                                            <td className="amount positive">{formatCurrency(project.totalInflow)}</td>
                                            <td className="amount negative">{formatCurrency(project.totalOutflow)}</td>
                                            <td className={`amount ${project.netCashFlow >= 0 ? 'positive' : 'negative'}`}>
                                                {formatCurrency(project.netCashFlow)}
                                            </td>
                                            <td>
                                                <button 
                                                    className="details-btn"
                                                    onClick={() => {
                                                        const row = document.getElementById(`details-${project.projectId}`);
                                                        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
                                                    }}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                        <tr id={`details-${project.projectId}`} className="details-row" style={{ display: 'none' }}>
                                            <td colSpan="6">
                                                <div className="transaction-details">
                                                    <h4>Transaction Details</h4>
                                                    <table className="sub-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Date</th>
                                                                <th>Type</th>
                                                                <th>Description</th>
                                                                <th>Category</th>
                                                                <th>Reference</th>
                                                                <th>Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {project.transactions && project.transactions.map((trans, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{trans.transactionDate}</td>
                                                                    <td>{trans.type}</td>
                                                                    <td>{trans.description}</td>
                                                                    <td>{trans.category}</td>
                                                                    <td>{trans.referenceNumber}</td>
                                                                    <td className={`amount ${trans.type === 'INFLOW' ? 'positive' : 'negative'}`}>
                                                                        {formatCurrency(trans.amount)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan="2"><strong>Grand Total</strong></td>
                                    <td className="amount positive">
                                        <strong>
                                            {formatCurrency(
                                                cashFlowData.projectSummaries.reduce((sum, p) => sum + (p.totalInflow || 0), 0)
                                            )}
                                        </strong>
                                    </td>
                                    <td className="amount negative">
                                        <strong>
                                            {formatCurrency(
                                                cashFlowData.projectSummaries.reduce((sum, p) => sum + (p.totalOutflow || 0), 0)
                                            )}
                                        </strong>
                                    </td>
                                    <td className="amount">
                                        <strong>
                                            {formatCurrency(
                                                cashFlowData.projectSummaries.reduce((sum, p) => sum + (p.netCashFlow || 0), 0)
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

export default ReportDashboard;