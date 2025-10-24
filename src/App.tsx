import React, { useState, useEffect } from 'react';
import { Project, Node } from './types';
import { 
  loadProjects, 
  saveProjects, 
  createProject,
  updateProjectAccess 
} from './utils/dataManager';
import ProjectList from './components/ProjectList';
import TreeView from './components/TreeView';
import NodeDetail from './components/NodeDetail';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Load projects on mount
  useEffect(() => {
    const loadedProjects = loadProjects();
    setProjects(loadedProjects);
    
    // Auto-select most recently accessed project
    if (loadedProjects.length > 0) {
      const mostRecent = loadedProjects.reduce((prev, current) => 
        current.lastAccessedAt > prev.lastAccessedAt ? current : prev
      );
      handleSelectProject(mostRecent);
    }
  }, []);

  // Save projects whenever they change
  useEffect(() => {
    if (projects.length > 0) {
      saveProjects(projects);
    }
  }, [projects]);

  const handleSelectProject = (project: Project) => {
    const updated = updateProjectAccess(project);
    setCurrentProject(updated);
    setSelectedNode(null);
    
    // Update in projects array
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleCreateProject = (name: string, description?: string) => {
    const newProject = createProject(name, description);
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      setSelectedNode(null);
    }
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (currentProject?.id === updatedProject.id) {
      setCurrentProject(updatedProject);
      
      // Update selected node if it still exists
      if (selectedNode) {
        const updatedNode = updatedProject.nodes.find(n => n.id === selectedNode.id);
        setSelectedNode(updatedNode || null);
      }
    }
  };

  const handleSelectNode = (node: Node | null) => {
    setSelectedNode(node);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Chronicle</h1>
          <span className="text-sm text-gray-500">Track your problem-solving journey</span>
        </div>
        <div className="text-sm text-gray-600">
          {currentProject && (
            <span>Project: <strong>{currentProject.name}</strong></span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Project List */}
        <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <ProjectList
            projects={projects}
            currentProject={currentProject}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
        </aside>

        {/* Middle - Tree View */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {currentProject ? (
            <TreeView
              project={currentProject}
              selectedNode={selectedNode}
              onSelectNode={handleSelectNode}
              onUpdateProject={handleUpdateProject}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">No project selected</p>
                <p className="text-sm">Create a new project to get started</p>
              </div>
            </div>
          )}
        </main>

        {/* Right Panel - Node Detail */}
        {selectedNode && currentProject && (
          <aside className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
            <NodeDetail
              node={selectedNode}
              project={currentProject}
              onUpdateProject={handleUpdateProject}
              onClose={() => setSelectedNode(null)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default App;