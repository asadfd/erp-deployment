import React, { useState, useEffect } from 'react';
import MRFForm from './MRFForm';
import MRFList from './MRFList';
import MRFApprovalDashboard from './MRFApprovalDashboard';

const MRFManagement = ({ onBack }) => {
    const [currentView, setCurrentView] = useState('main');
    const [editingMRF, setEditingMRF] = useState(null);
    const [userRoles, setUserRoles] = useState([]);

    useEffect(() => {
        checkUserRoles();
    }, []);

    const checkUserRoles = async () => {
        try {
            const response = await fetch('/api/auth/status', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setUserRoles(data.authorities || []);
            }
        } catch (err) {
            console.error('Error checking user roles:', err);
        }
    };

    const handleCreateMRF = () => {
        setEditingMRF(null);
        setCurrentView('form');
    };

    const handleEditMRF = (mrf) => {
        setEditingMRF(mrf);
        setCurrentView('form');
    };

    const handleBackToMain = () => {
        setCurrentView('main');
        setEditingMRF(null);
    };

    const canApprove = () => {
        return userRoles.some(role => role.authority === 'ROLE_ADMIN') || 
               userRoles.some(role => role.authority === 'ROLE_SUPER_ADMIN');
    };

    const canManage = () => {
        return userRoles.some(role => role.authority === 'ROLE_PROJECTMANAGER') || 
               userRoles.some(role => role.authority === 'ROLE_ADMIN') || 
               userRoles.some(role => role.authority === 'ROLE_SUPER_ADMIN');
    };

    // Styles
    const containerStyle = {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    };

    const titleStyle = {
        marginBottom: '30px',
        color: '#333',
        textAlign: 'center',
        fontSize: '28px'
    };

    const buttonsContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '40px'
    };

    const buttonRowStyle = {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center'
    };

    const buttonStyle = {
        padding: '15px 30px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        minWidth: '200px',
        transition: 'all 0.3s ease'
    };

    const createButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#28a745',
        color: 'white'
    };

    const listButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#007bff',
        color: 'white'
    };

    const approvalButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#17a2b8',
        color: 'white'
    };

    const backButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#6c757d',
        color: 'white'
    };

    const sectionTitleStyle = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#495057',
        marginBottom: '15px',
        textAlign: 'center'
    };

    const infoBoxStyle = {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
        padding: '20px',
        borderRadius: '6px',
        marginBottom: '30px',
        border: '1px solid #bee5eb'
    };

    const roleInfoStyle = {
        fontSize: '14px',
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: '20px'
    };

    // Render based on current view
    if (currentView === 'form') {
        return (
            <MRFForm
                editingMRF={editingMRF}
                onBack={handleBackToMain}
            />
        );
    }

    if (currentView === 'list') {
        return (
            <MRFList
                onBack={handleBackToMain}
                onEdit={handleEditMRF}
            />
        );
    }

    if (currentView === 'approval') {
        return (
            <MRFApprovalDashboard
                onBack={handleBackToMain}
            />
        );
    }

    // Main view
    return (
        <div style={containerStyle}>
            <h2 style={titleStyle}>Material Request Form Management</h2>

            <div style={infoBoxStyle}>
                <strong>About MRF System:</strong>
                <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                    <li>Create material request forms for items needed in your projects</li>
                    <li>Requests under 2,000 AED require Admin approval</li>
                    <li>Requests 2,000 AED and above require SuperAdmin approval</li>
                    <li>Track all your requests and their approval status</li>
                </ul>
            </div>

            {userRoles.length > 0 && (
                <div style={roleInfoStyle}>
                    <strong>Your Role(s):</strong> {userRoles.map(role => role.authority.replace('ROLE_', '')).join(', ')}
                </div>
            )}

            <div style={buttonsContainerStyle}>
                {canManage() && (
                    <>
                        <div style={sectionTitleStyle}>MRF Operations</div>
                        <div style={buttonRowStyle}>
                            <button
                                onClick={handleCreateMRF}
                                style={createButtonStyle}
                            >
                                Create New MRF
                            </button>
                            
                            <button
                                onClick={() => setCurrentView('list')}
                                style={listButtonStyle}
                            >
                                View My MRFs
                            </button>
                        </div>
                    </>
                )}

                {canApprove() && (
                    <>
                        <div style={sectionTitleStyle}>Approval Dashboard</div>
                        <div style={buttonRowStyle}>
                            <button
                                onClick={() => setCurrentView('approval')}
                                style={approvalButtonStyle}
                            >
                                MRF Approval Dashboard
                            </button>
                        </div>
                    </>
                )}

                {!canManage() && !canApprove() && (
                    <div style={{...infoBoxStyle, backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb'}}>
                        <strong>Access Restricted:</strong> You don't have permission to access MRF features. 
                        Contact your administrator to get the required roles.
                    </div>
                )}

                <div style={buttonRowStyle}>
                    <button
                        onClick={onBack}
                        style={backButtonStyle}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MRFManagement;