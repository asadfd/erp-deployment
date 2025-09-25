import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectBreakdownReport.css';

const ProjectBreakdownReport = () => {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProjectBreakdownReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/reports/project-breakdown?startDate=${startDate}&endDate=${endDate}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch project breakdown report');
            }
            
            const data = await response.json();
            setProjectData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectBreakdownReport();
    }, []);

    const handleDateChange = () => {
        fetchProjectBreakdownReport();
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

    const getProfitLossColor = (amount) => {
        if (amount > 0) return 'positive';
        if (amount < 0) return 'negative';
        return 'neutral';
    };

    return (
        <div className="project-breakdown-report">
            <div className="report-header">
                <h2>Project Breakdown Report</h2>
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

            {projectData && projectData.projectBreakdowns && (
                <div className="report-content">
                    <h3>Project Financial Breakdown</h3>
                    {projectData.projectBreakdowns.length === 0 ? (
                        <p>No project data found for the selected date range.</p>
                    ) : (
                        <div className="projects-grid">
                            {projectData.projectBreakdowns.map((project) => (
                                <div key={project.projectId} className="project-card">
                                    <div className="project-header">
                                        <h4>Project #{project.projectId}</h4>
                                        <div className="project-info">
                                            <span className="project-type">{project.projectType}</span>
                                            <span className="project-stage">{project.projectStage}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="project-description">
                                        <p>{project.projectDescription}</p>
                                    </div>

                                    <div className="project-metrics">
                                        <div className="metric-section">
                                            <h5>Budget & Revenue</h5>
                                            <div className="metric-row">
                                                <span>Project Budget:</span>
                                                <span className="amount">{formatCurrency(project.projectBudget)}</span>
                                            </div>
                                            <div className="metric-row">
                                                <span>Cash Inflow:</span>
                                                <span className="amount positive">{formatCurrency(project.cashInflow)}</span>
                                            </div>
                                            <div className="metric-row">
                                                <span>Cash Outflow:</span>
                                                <span className="amount negative">{formatCurrency(project.cashOutflow)}</span>
                                            </div>
                                            <div className="metric-row total">
                                                <span>Net Cash Flow:</span>
                                                <span className={`amount ${getProfitLossColor(project.netCashFlow)}`}>
                                                    {formatCurrency(project.netCashFlow)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="metric-section">
                                            <h5>Labor & Hours</h5>
                                            <div className="metric-row">
                                                <span>Total Labor Hours:</span>
                                                <span>{formatHours(project.totalLaborHours)} hrs</span>
                                            </div>
                                            <div className="metric-row">
                                                <span>Labor Cost:</span>
                                                <span className="amount">{formatCurrency(project.laborCost)}</span>
                                            </div>
                                        </div>

                                        <div className="metric-section">
                                            <h5>Inventory & Procurement</h5>
                                            <div className="metric-row">
                                                <span>Inventory Items Used:</span>
                                                <span>{project.totalInventoryItems} items</span>
                                            </div>
                                            <div className="metric-row">
                                                <span>Inventory Value:</span>
                                                <span className="amount">{formatCurrency(project.totalInventoryValue)}</span>
                                            </div>
                                            <div className="metric-row">
                                                <span>Purchase Orders:</span>
                                                <span>{project.purchaseOrderCount} orders</span>
                                            </div>
                                            <div className="metric-row">
                                                <span>Total PO Value:</span>
                                                <span className="amount">{formatCurrency(project.totalPOValue)}</span>
                                            </div>
                                        </div>

                                        <div className="metric-section summary">
                                            <h5>Project Summary</h5>
                                            <div className="metric-row">
                                                <span>Total Expenses:</span>
                                                <span className="amount negative">{formatCurrency(project.totalExpenses)}</span>
                                            </div>
                                            <div className="metric-row total">
                                                <span><strong>Profit/Loss:</strong></span>
                                                <span className={`amount ${getProfitLossColor(project.profitLoss)}`}>
                                                    <strong>{formatCurrency(project.profitLoss)}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {projectData.projectBreakdowns.length > 0 && (
                        <div className="overall-summary">
                            <h3>Overall Summary</h3>
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <h4>Total Projects</h4>
                                    <div className="summary-value">
                                        {projectData.projectBreakdowns.length}
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <h4>Total Budget</h4>
                                    <div className="summary-value">
                                        {formatCurrency(
                                            projectData.projectBreakdowns.reduce((sum, p) => sum + (p.projectBudget || 0), 0)
                                        )}
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <h4>Total Revenue</h4>
                                    <div className="summary-value positive">
                                        {formatCurrency(
                                            projectData.projectBreakdowns.reduce((sum, p) => sum + (p.cashInflow || 0), 0)
                                        )}
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <h4>Total Expenses</h4>
                                    <div className="summary-value negative">
                                        {formatCurrency(
                                            projectData.projectBreakdowns.reduce((sum, p) => sum + (p.totalExpenses || 0), 0)
                                        )}
                                    </div>
                                </div>
                                <div className="summary-card">
                                    <h4>Net Profit/Loss</h4>
                                    <div className={`summary-value ${getProfitLossColor(
                                        projectData.projectBreakdowns.reduce((sum, p) => sum + (p.profitLoss || 0), 0)
                                    )}`}>
                                        {formatCurrency(
                                            projectData.projectBreakdowns.reduce((sum, p) => sum + (p.profitLoss || 0), 0)
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProjectBreakdownReport;