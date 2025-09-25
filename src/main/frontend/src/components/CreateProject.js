import React, { useState, useEffect } from 'react';
import EmployeeAssignment from './EmployeeAssignment';
import TimesheetMatrix from './TimesheetMatrix';
import ProjectExpenseSummary from './ProjectExpenseSummary';
import ProjectInventory from './ProjectInventory';

const CreateProject = ({ onProjectSaved, onCancel, initialData, isUpdateMode = false }) => {
    const [formData, setFormData] = useState(initialData ? {
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        projectType: initialData.projectType || '',
        projectStage: initialData.projectStage || '',
        projectDescription: initialData.projectDescription || '',
        projectBudget: initialData.projectBudget ? initialData.projectBudget.toString() : '',
        perDayRate: initialData.perDayRate ? initialData.perDayRate.toString() : '',
        perHourRate: initialData.perHourRate ? initialData.perHourRate.toString() : ''
    } : {
        startDate: '',
        endDate: '',
        projectType: '',
        projectStage: '',
        projectDescription: '',
        projectBudget: '',
        perDayRate: '',
        perHourRate: ''
    });
    
    const [currentSection, setCurrentSection] = useState(1);
    const [projectId, setProjectId] = useState(initialData ? initialData.id : null);
    const [assignedEmployees, setAssignedEmployees] = useState([]);
    const [inventoryExpense, setInventoryExpense] = useState(0);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateSection = (section) => {
        switch (section) {
            case 1:
                return formData.startDate && formData.endDate && formData.projectType && formData.projectStage;
            case 2:
                return formData.projectBudget || formData.perDayRate || formData.perHourRate;
            case 3:
                return assignedEmployees.length > 0;
            default:
                return true;
        }
    };

    const handleSaveProject = async () => {
        try {
            const projectData = {
                ...formData,
                projectBudget: formData.projectBudget ? parseFloat(formData.projectBudget) : null,
                perDayRate: formData.perDayRate ? parseFloat(formData.perDayRate) : null,
                perHourRate: formData.perHourRate ? parseFloat(formData.perHourRate) : null
            };

            const url = isUpdateMode ? `/api/projects/${projectId}` : '/api/projects';
            const method = isUpdateMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(projectData)
            });

            if (response.ok) {
                const savedProject = await response.json();
                console.log('Project saved successfully:', savedProject);
                setProjectId(savedProject.id);
                return savedProject;
            } else {
                alert(`Failed to ${isUpdateMode ? 'update' : 'save'} project`);
                return null;
            }
        } catch (error) {
            console.error(`Error ${isUpdateMode ? 'updating' : 'saving'} project:`, error);
            alert(`Error ${isUpdateMode ? 'updating' : 'saving'} project`);
            return null;
        }
    };

    const handleNext = async () => {
        if (validateSection(currentSection)) {
            if (currentSection === 2) {
                const savedProject = await handleSaveProject();
                if (savedProject) {
                    setCurrentSection(3);
                }
            } else {
                setCurrentSection(currentSection + 1);
            }
        } else {
            let message = 'Please fill in all required fields';
            if (currentSection === 3) {
                message = 'Please assign at least one employee to continue';
            }
            alert(message);
        }
    };

    const handlePrevious = () => {
        setCurrentSection(currentSection - 1);
    };

    const handleEmployeesAssigned = (employees) => {
        setAssignedEmployees(employees);
        // Don't auto-advance to section 4, let navigation buttons handle it
    };

    const handleInventoryExpenseUpdate = (expense) => {
        setInventoryExpense(expense);
    };

    const handleFinish = async () => {
        try {
            // Update project budget with inventory expenses deducted
            if (inventoryExpense > 0) {
                const updatedBudget = (parseFloat(formData.projectBudget) || 0) - inventoryExpense;
                const updatedProjectData = {
                    ...formData,
                    projectBudget: updatedBudget,
                    perDayRate: formData.perDayRate ? parseFloat(formData.perDayRate) : null,
                    perHourRate: formData.perHourRate ? parseFloat(formData.perHourRate) : null
                };

                const response = await fetch(`/api/projects/${projectId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(updatedProjectData)
                });

                if (!response.ok) {
                    console.error('Failed to update project budget');
                }
            }

            onProjectSaved();
        } catch (error) {
            console.error('Error updating project:', error);
            onProjectSaved(); // Continue anyway
        }
    };

    const renderSection1 = () => {
        const sectionStyle = {
            marginBottom: '30px'
        };

        const titleStyle = {
            color: '#333',
            borderBottom: '2px solid #007bff',
            paddingBottom: '10px',
            marginBottom: '20px'
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

        const textareaStyle = {
            ...inputStyle,
            minHeight: '100px',
            resize: 'vertical'
        };

        return (
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Section 1: Project Details</h3>
                <div style={formRowStyle}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Start Date *</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>End Date *</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            style={inputStyle}
                            min={formData.startDate}
                            required
                        />
                    </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Project Type *</label>
                        <select
                            name="projectType"
                            value={formData.projectType}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        >
                            <option value="">Select Project Type</option>
                            <option value="JOINERY">JOINERY</option>
                            <option value="PLASTERING">PLASTERING</option>
                            <option value="GYPSUM">GYPSUM</option>
                        </select>
                    </div>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Project Stage *</label>
                        <select
                            name="projectStage"
                            value={formData.projectStage}
                            onChange={handleInputChange}
                            style={inputStyle}
                            required
                        >
                            <option value="">Select Project Stage</option>
                            <option value="INITIATION STAGE">INITIATION STAGE</option>
                            <option value="DRAWING STAGE">DRAWING STAGE</option>
                            <option value="SAMPLE SENT STAGE">SAMPLE SENT STAGE</option>
                            <option value="SAMPLE APPROVAL STAGE">SAMPLE APPROVAL STAGE</option>
                            <option value="INVENTORY CHECK STAGE">INVENTORY CHECK STAGE</option>
                            <option value="ORDER STAGE(IF INVENTORY IS LESS)">ORDER STAGE(IF INVENTORY IS LESS)</option>
                            <option value="PROCUREMENT STAGE">PROCUREMENT STAGE</option>
                            <option value="SITEWORK START STAGE">SITEWORK START STAGE</option>
                            <option value="COMPLETED">COMPLETED</option>
                        </select>
                    </div>
                </div>
                <div style={formGroupStyle}>
                    <label style={labelStyle}>Project Description</label>
                    <textarea
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleInputChange}
                        style={textareaStyle}
                        placeholder="Enter project description"
                        rows="4"
                    />
                </div>
            </div>
        );
    };

    const renderSection2 = () => {
        const sectionStyle = {
            marginBottom: '30px'
        };

        const titleStyle = {
            color: '#333',
            borderBottom: '2px solid #007bff',
            paddingBottom: '10px',
            marginBottom: '20px'
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

        const noteStyle = {
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px',
            borderLeft: '4px solid #17a2b8',
            marginTop: '10px',
            color: '#6c757d',
            fontSize: '14px'
        };

        return (
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Section 2: Budget Information</h3>
                <div style={{ marginBottom: '15px' }}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Project Budget</label>
                        <input
                            type="number"
                            step="0.01"
                            name="projectBudget"
                            value={formData.projectBudget}
                            onChange={handleInputChange}
                            style={inputStyle}
                            placeholder="Enter total project budget"
                        />
                    </div>
                </div>
                <div style={formRowStyle}>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Per Day Rate</label>
                        <input
                            type="number"
                            step="0.01"
                            name="perDayRate"
                            value={formData.perDayRate}
                            onChange={handleInputChange}
                            style={inputStyle}
                            placeholder="Rate per day"
                        />
                    </div>
                    <div style={formGroupStyle}>
                        <label style={labelStyle}>Per Hour Rate</label>
                        <input
                            type="number"
                            step="0.01"
                            name="perHourRate"
                            value={formData.perHourRate}
                            onChange={handleInputChange}
                            style={inputStyle}
                            placeholder="Rate per hour"
                        />
                    </div>
                </div>
                <div style={noteStyle}>
                    <small>* At least one rate field (Budget, Per Day Rate, or Per Hour Rate) is required</small>
                </div>
            </div>
        );
    };

    const renderSection3 = () => {
        const sectionStyle = {
            marginBottom: '30px'
        };

        const titleStyle = {
            color: '#333',
            borderBottom: '2px solid #007bff',
            paddingBottom: '10px',
            marginBottom: '20px'
        };

        return (
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Section 3: Assign Resources</h3>
                {projectId && (
                    <EmployeeAssignment
                        projectId={projectId}
                        onEmployeesAssigned={handleEmployeesAssigned}
                    />
                )}
            </div>
        );
    };

    const renderSection4 = () => {
        const sectionStyle = {
            marginBottom: '30px'
        };

        const titleStyle = {
            color: '#333',
            borderBottom: '2px solid #007bff',
            paddingBottom: '10px',
            marginBottom: '20px'
        };

        return (
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Section 4: Timesheet & Expense Summary</h3>
                {projectId && (
                    <>
                        <TimesheetMatrix
                            projectId={projectId}
                            startDate={formData.startDate}
                            endDate={formData.endDate}
                            assignedEmployees={assignedEmployees}
                        />
                        <ProjectExpenseSummary projectId={projectId} />
                    </>
                )}
            </div>
        );
    };

    const renderSection5 = () => {
        const sectionStyle = {
            marginBottom: '30px'
        };

        const titleStyle = {
            color: '#333',
            borderBottom: '2px solid #007bff',
            paddingBottom: '10px',
            marginBottom: '20px'
        };

        return (
            <div style={sectionStyle}>
                <h3 style={titleStyle}>Section 5: Project Inventory</h3>
                {projectId && (
                    <ProjectInventory
                        projectId={projectId}
                        projectBudget={parseFloat(formData.projectBudget) || 0}
                        onExpenseUpdate={handleInventoryExpenseUpdate}
                    />
                )}
            </div>
        );
    };

    const renderNavigationButtons = () => {
        const navigationStyle = {
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            marginTop: '30px'
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

        const secondaryButtonStyle = {
            ...buttonStyle,
            backgroundColor: '#6c757d',
            color: 'white'
        };

        const successButtonStyle = {
            ...buttonStyle,
            backgroundColor: '#28a745',
            color: 'white'
        };

        const cancelButtonStyle = {
            ...buttonStyle,
            backgroundColor: '#dc3545',
            color: 'white'
        };

        return (
            <div style={navigationStyle}>
                {currentSection > 1 && (
                    <button 
                        type="button" 
                        onClick={handlePrevious} 
                        style={secondaryButtonStyle}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                        Previous
                    </button>
                )}
                {currentSection < 5 ? (
                    <button 
                        type="button" 
                        onClick={handleNext} 
                        style={primaryButtonStyle}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                    >
                        {currentSection === 2 ? (isUpdateMode ? 'Update & Continue' : 'Save & Continue') : 'Next'}
                    </button>
                ) : (
                    <button 
                        type="button" 
                        onClick={handleFinish} 
                        style={successButtonStyle}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                    >
                        Finish
                    </button>
                )}
                <button 
                    type="button" 
                    onClick={onCancel} 
                    style={cancelButtonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                    Cancel
                </button>
            </div>
        );
    };

    const containerStyle = {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    };

    const headerStyle = {
        textAlign: 'center',
        marginBottom: '30px'
    };

    const titleStyle = {
        color: '#333',
        marginBottom: '20px'
    };

    const indicatorsStyle = {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px'
    };

    const indicatorStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: '#ddd',
        transition: 'all 0.3s ease'
    };

    const activeIndicatorStyle = {
        ...indicatorStyle,
        backgroundColor: '#007bff'
    };

    const completedIndicatorStyle = {
        ...indicatorStyle,
        backgroundColor: '#28a745'
    };

    const getIndicatorStyle = (num) => {
        if (num === currentSection) return activeIndicatorStyle;
        if (num < currentSection) return completedIndicatorStyle;
        return indicatorStyle;
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2 style={titleStyle}>{isUpdateMode ? 'Update Project' : 'Create New Project'}</h2>
                <div style={indicatorsStyle}>
                    {[1, 2, 3, 4, 5].map(num => (
                        <div 
                            key={num} 
                            style={getIndicatorStyle(num)}
                        >
                            {num}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                {currentSection === 1 && renderSection1()}
                {currentSection === 2 && renderSection2()}
                {currentSection === 3 && renderSection3()}
                {currentSection === 4 && renderSection4()}
                {currentSection === 5 && renderSection5()}
                
                {renderNavigationButtons()}
            </form>
        </div>
    );
};

export default CreateProject;