import React, { useState, useEffect } from 'react';
import CreateProject from './CreateProject';

const UpdateProject = ({ project, onProjectSaved, onCancel }) => {
    // For now, we'll reuse the CreateProject component but pre-populate it with existing data
    // In a more sophisticated implementation, you might want a separate component
    
    if (!project) {
        return (
            <div className="update-project">
                <h2>Update Project</h2>
                <p>No project selected for update.</p>
                <button onClick={onCancel} className="btn-cancel">
                    Back
                </button>
            </div>
        );
    }

    return (
        <CreateProject 
            initialData={project}
            isUpdateMode={true}
            onProjectSaved={onProjectSaved}
            onCancel={onCancel}
        />
    );
};

export default UpdateProject;