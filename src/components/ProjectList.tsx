import React, { useState } from 'react';
import { Project } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ProjectListProps {
  projects: Project[];
  currentProject: Project | null;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string, description?: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  currentProject,
  onSelectProject,
  onCreateProject,
  onDeleteProject
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleCreate = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim(), newProjectDesc.trim() || undefined);
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreating(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this project? This cannot be undone.')) {
      onDeleteProject(projectId);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-700">Projects</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + New
        </button>
      </div>

      {/* Create Project Form */}
      {isCreating && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="text"
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={newProjectDesc}
            onChange={(e) => setNewProjectDesc(e.target.value)}
            className="w-full px-3 py-2 mb-2 border border-gray-300 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewProjectName('');
                setNewProjectDesc('');
              }}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Project List */}
      <div className="space-y-2">
        {projects.length === 0 && !isCreating && (
          <p className="text-sm text-gray-500 text-center py-8">
            No projects yet.<br />Create one to start!
          </p>
        )}
        
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={`p-3 rounded-lg cursor-pointer transition-colors group ${
              currentProject?.id === project.id
                ? 'bg-blue-100 border-2 border-blue-500'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-medium text-gray-900 text-sm">
                {project.name}
              </h3>
              <button
                onClick={(e) => handleDelete(e, project.id)}
                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {project.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {project.description}
              </p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{project.nodes.length} nodes</span>
              <span>
                {formatDistanceToNow(new Date(project.lastAccessedAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;