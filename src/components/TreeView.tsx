import React, { useState } from 'react';
import { Project, Node } from '../types';
import { 
  getRootNodes, 
  createNode, 
  addNodeToProject,
  deleteNodeFromProject,
  updateNodeInProject
} from '../utils/dataManager';
import TreeNode from './TreeNode';

interface TreeViewProps {
  project: Project;
  selectedNode: Node | null;
  onSelectNode: (node: Node | null) => void;
  onUpdateProject: (project: Project) => void;
}

const TreeView: React.FC<TreeViewProps> = ({
  project,
  selectedNode,
  onSelectNode,
  onUpdateProject
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isCreatingRoot, setIsCreatingRoot] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState('');

  const rootNodes = getRootNodes(project);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleCreateRoot = () => {
    if (newNodeTitle.trim()) {
      const newNode = createNode({
        title: newNodeTitle.trim(),
        parentId: null
      });
      const updatedProject = addNodeToProject(project, newNode);
      onUpdateProject(updatedProject);
      setNewNodeTitle('');
      setIsCreatingRoot(false);
      setExpandedNodes(prev => new Set(prev).add(newNode.id));
    }
  };

  const handleCreateChild = (parentId: string, title: string) => {
    const newNode = createNode({
      title,
      parentId
    });
    const updatedProject = addNodeToProject(project, newNode);
    onUpdateProject(updatedProject);
    setExpandedNodes(prev => new Set(prev).add(parentId));
  };

  const handleDeleteNode = (nodeId: string) => {
    if (window.confirm('Delete this node and all its children?')) {
      const updatedProject = deleteNodeFromProject(project, nodeId);
      onUpdateProject(updatedProject);
      if (selectedNode?.id === nodeId) {
        onSelectNode(null);
      }
    }
  };

  const handleUpdateNode = (nodeId: string, updates: any) => {
    const updatedProject = updateNodeInProject(project, nodeId, updates);
    onUpdateProject(updatedProject);
  };

  const expandAll = () => {
    setExpandedNodes(new Set(project.nodes.map(n => n.id)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
          {project.description && (
            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Add Root Node Button */}
      {!isCreatingRoot && (
        <button
          onClick={() => setIsCreatingRoot(true)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          + Add Root Node
        </button>
      )}

      {/* Create Root Node Form */}
      {isCreatingRoot && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <input
            type="text"
            placeholder="Node title..."
            value={newNodeTitle}
            onChange={(e) => setNewNodeTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateRoot();
              if (e.key === 'Escape') {
                setIsCreatingRoot(false);
                setNewNodeTitle('');
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateRoot}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreatingRoot(false);
                setNewNodeTitle('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="space-y-1">
        {rootNodes.length === 0 && !isCreatingRoot && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No nodes yet</p>
            <p className="text-sm">Click "Add Root Node" to start</p>
          </div>
        )}

        {rootNodes.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            project={project}
            isExpanded={expandedNodes.has(node.id)}
            isSelected={selectedNode?.id === node.id}
            expandedNodes={expandedNodes}
            onToggleExpand={toggleExpand}
            onSelect={onSelectNode}
            onCreateChild={handleCreateChild}
            onDelete={handleDeleteNode}
            onUpdate={handleUpdateNode}
          />
        ))}
      </div>
    </div>
  );
};

export default TreeView;