import React, { useState } from 'react';
import './ProjectList.css';

const ProjectList = ({ projects, onUpdateProject, onDeleteProject, onCreateProject, onBack }) => {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingProjects, setUpdatingProjects] = useState(new Set());

    const getProjectStatus = (project) => {
        const today = new Date();
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        
        if (today < startDate) return 'upcoming';
        if (today > endDate) return 'completed';
        return 'active';
    };

    const filteredProjects = projects.filter(project => {
        const matchesFilter = filter === 'all' || getProjectStatus(project) === filter;
        const matchesSearch = project.projectType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (project.projectDescription && project.projectDescription.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    const isProjectEligibleForCompletion = (project) => {
        const today = new Date();
        const endDate = new Date(project.endDate);
        return today >= endDate && project.projectStage !== 'COMPLETED';
    };

    const handleProjectCompletion = async (project) => {
        if (updatingProjects.has(project.id)) return;
        
        setUpdatingProjects(prev => new Set([...prev, project.id]));
        
        try {
            const updatedProject = {
                ...project,
                projectStage: 'COMPLETED'
            };
            
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updatedProject)
            });
            
            if (response.ok) {
                const result = await response.json();
                if (onUpdateProject) {
                    // Trigger parent component to refresh project list
                    onUpdateProject(result);
                }
            } else {
                alert('Failed to mark project as completed. Please try again.');
            }
        } catch (error) {
            console.error('Error updating project completion:', error);
            alert('An error occurred while marking the project as completed.');
        } finally {
            setUpdatingProjects(prev => {
                const newSet = new Set(prev);
                newSet.delete(project.id);
                return newSet;
            });
        }
    };

    const getStatusBadge = (project) => {
        const status = getProjectStatus(project);
        const statusColors = {
            upcoming: '#ffc107',
            active: '#28a745',
            completed: '#6c757d'
        };
        
        const badgeStyle = {
            backgroundColor: statusColors[status],
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold'
        };
        
        return (
            <span style={badgeStyle}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
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

    const updateButtonStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '10px',
        marginRight: '4px'
    };

    const deleteButtonStyle = {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '4px 8px',
        borderRadius: '3px',
        cursor: 'pointer',
        fontSize: '10px'
    };

    return (
        <div className="project-list">
            <div className="list-header">
                <h2>Project List</h2>
                <div className="header-actions">
                    <button onClick={onCreateProject} className="btn-create">
                        Create New Project
                    </button>
                    <button onClick={onBack} className="btn-back">
                        Back to Dashboard
                    </button>
                </div>
            </div>

            <div className="list-controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filter-tabs">
                    <button
                        onClick={() => setFilter('all')}
                        className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                    >
                        All ({projects.length})
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
                    >
                        Upcoming ({projects.filter(p => getProjectStatus(p) === 'upcoming').length})
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                    >
                        Active ({projects.filter(p => getProjectStatus(p) === 'active').length})
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                    >
                        Completed ({projects.filter(p => getProjectStatus(p) === 'completed').length})
                    </button>
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="no-projects">
                    <p>No projects found.</p>
                    {projects.length === 0 ? (
                        <button onClick={onCreateProject} className="btn-create-first">
                            Create Your First Project
                        </button>
                    ) : null}
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Project Type</th>
                                <th style={thStyle}>Project Stage</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Start Date</th>
                                <th style={thStyle}>End Date</th>
                                <th style={thStyle}>Budget</th>
                                <th style={thStyle}>Day Rate</th>
                                <th style={thStyle}>Hour Rate</th>
                                <th style={thStyle}>Description</th>
                                <th style={thStyle}>Complete</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map(project => (
                                <tr key={project.id} style={{ cursor: 'pointer' }}>
                                    <td style={tdStyle} title={project.projectType}>{project.projectType}</td>
                                    <td style={tdStyle} title={project.projectStage || 'N/A'}>{project.projectStage || 'N/A'}</td>
                                    <td style={tdStyle}>{getStatusBadge(project)}</td>
                                    <td style={tdStyle} title={formatDate(project.startDate)}>{formatDate(project.startDate)}</td>
                                    <td style={tdStyle} title={formatDate(project.endDate)}>{formatDate(project.endDate)}</td>
                                    <td style={tdStyle} title={formatCurrency(project.projectBudget)}>{formatCurrency(project.projectBudget)}</td>
                                    <td style={tdStyle} title={formatCurrency(project.perDayRate)}>{formatCurrency(project.perDayRate)}</td>
                                    <td style={tdStyle} title={formatCurrency(project.perHourRate)}>{formatCurrency(project.perHourRate)}</td>
                                    <td style={{...tdStyle, maxWidth: '200px'}} title={project.projectDescription || 'N/A'}>
                                        {project.projectDescription || 'N/A'}
                                    </td>
                                    <td style={{...tdStyle, textAlign: 'center'}}>
                                        {isProjectEligibleForCompletion(project) ? (
                                            <button
                                                onClick={() => handleProjectCompletion(project)}
                                                disabled={updatingProjects.has(project.id)}
                                                style={{
                                                    backgroundColor: updatingProjects.has(project.id) ? '#ccc' : '#28a745',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '4px 8px',
                                                    borderRadius: '3px',
                                                    cursor: updatingProjects.has(project.id) ? 'not-allowed' : 'pointer',
                                                    fontSize: '10px',
                                                    minWidth: '60px'
                                                }}
                                                title="Mark project as completed (only available after end date)"
                                            >
                                                {updatingProjects.has(project.id) ? '...' : '✓ Complete'}
                                            </button>
                                        ) : (
                                            <span style={{ fontSize: '10px', color: '#6c757d' }}>
                                                {project.projectStage === 'COMPLETED' ? 'Done' : 'Not ready'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{...tdStyle, textAlign: 'center'}}>
                                        <button
                                            onClick={() => onUpdateProject(project)}
                                            style={updateButtonStyle}
                                        >
                                            Update
                                        </button>
                                        <button
                                            onClick={() => onDeleteProject(project.id)}
                                            style={deleteButtonStyle}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
                Total projects: {filteredProjects.length}
            </div>
        </div>
    );
};

export default ProjectList;