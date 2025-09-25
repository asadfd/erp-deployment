import React, { useState, useEffect } from 'react';
import CreateProject from './CreateProject';
import UpdateProject from './UpdateProject';
import ProjectList from './ProjectList';

const ProjectManager = () => {
    const [activeView, setActiveView] = useState('dashboard');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/projects', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const handleCreateProject = () => {
        setSelectedProject(null);
        setActiveView('create');
    };

    const handleUpdateProject = (project) => {
        setSelectedProject(project);
        setActiveView('update');
    };

    const handleDeleteProject = async (projectId) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                const response = await fetch(`/api/projects/${projectId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (response.ok) {
                    fetchProjects();
                    alert('Project deleted successfully');
                } else {
                    alert('Failed to delete project');
                }
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Error deleting project');
            }
        }
    };

    const handleProjectSaved = () => {
        fetchProjects();
        setActiveView('list');
    };

    const renderDashboard = () => {
        const dashboardStyle = {
            textAlign: 'center',
            padding: '40px 20px'
        };

        const titleStyle = {
            color: '#333',
            marginBottom: '40px',
            fontSize: '2rem'
        };

        const buttonsContainerStyle = {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            maxWidth: '600px',
            margin: '0 auto'
        };

        const buttonStyle = {
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            color: 'white'
        };

        const primaryButtonStyle = {
            ...buttonStyle,
            backgroundColor: '#007bff'
        };

        const secondaryButtonStyle = {
            ...buttonStyle,
            backgroundColor: '#6c757d'
        };

        const successButtonStyle = {
            ...buttonStyle,
            backgroundColor: '#28a745'
        };

        const dangerButtonStyle = {
            ...buttonStyle,
            backgroundColor: '#dc3545'
        };

        return (
            <div style={dashboardStyle}>
                <h2 style={titleStyle}>Project Manager Dashboard</h2>
                <div style={buttonsContainerStyle}>
                    <button 
                        style={successButtonStyle}
                        onClick={handleCreateProject}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                    >
                        Create Project
                    </button>
                    <button 
                        style={primaryButtonStyle}
                        onClick={() => setActiveView('list')}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
                        Update Project
                    </button>
                    <button 
                        style={dangerButtonStyle}
                        onClick={() => setActiveView('list')}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                        Delete Project
                    </button>
                    <button 
                        style={secondaryButtonStyle}
                        onClick={() => setActiveView('list')}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                        List Projects
                    </button>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeView) {
            case 'create':
                return (
                    <CreateProject 
                        onProjectSaved={handleProjectSaved}
                        onCancel={() => setActiveView('dashboard')}
                    />
                );
            case 'update':
                return (
                    <UpdateProject 
                        project={selectedProject}
                        onProjectSaved={handleProjectSaved}
                        onCancel={() => setActiveView('list')}
                    />
                );
            case 'list':
                return (
                    <ProjectList 
                        projects={projects}
                        onUpdateProject={handleUpdateProject}
                        onDeleteProject={handleDeleteProject}
                        onCreateProject={handleCreateProject}
                        onBack={() => setActiveView('dashboard')}
                    />
                );
            default:
                return renderDashboard();
        }
    };

    const containerStyle = {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    };

    return (
        <div style={containerStyle}>
            {renderContent()}
        </div>
    );
};

export default ProjectManager;