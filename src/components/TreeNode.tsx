import React, { useState } from 'react';
import { Node, Project, STATUS_COLORS, STATUS_ICONS } from '../types';

interface TreeNodeProps {
  node: Node;
  project: Project;
  isExpanded: boolean;
  isSelected: boolean;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
  onSelect: (node: Node) => void;
  onCreateChild: (parentId: string, title: string) => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: any) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  project,
  isExpanded,
  isSelected,
  expandedNodes,
  onToggleExpand,
  onSelect,
  onCreateChild,
  onDelete,
  onUpdate
}) => {
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [childTitle, setChildTitle] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const children = project.nodes.filter(n => n.parentId === node.id);
  const hasChildren = children.length > 0;

  const handleCreateChild = () => {
    if (childTitle.trim()) {
      onCreateChild(node.id, childTitle.trim());
      setChildTitle('');
      setIsCreatingChild(false);
    }
  };

  return (
    <div>
      {/* Node Row */}
      <div
        className={`flex items-center gap-2 p-2 rounded-lg transition-colors group ${
          isSelected
            ? 'bg-blue-100 border-2 border-blue-500'
            : 'hover:bg-gray-100 border-2 border-transparent'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Expand/Collapse Button */}
        <button
          onClick={() => onToggleExpand(node.id)}
          className={`w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          {isExpanded ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* Status Icon */}
        <span className="text-lg">{STATUS_ICONS[node.status]}</span>

        {/* Node Content */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => onSelect(node)}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{node.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_COLORS[node.status]}`}>
              {node.status}
            </span>
          </div>
        </div>

        {/* Action Buttons (show on hover) */}
        <div className={`flex gap-1 ${isHovered || isSelected ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          <button
            onClick={() => setIsCreatingChild(true)}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Add child node"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete node"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Create Child Form */}
      {isCreatingChild && (
        <div className="ml-7 mt-1 mb-2 p-3 bg-green-50 rounded-lg border-2 border-green-200">
          <input
            type="text"
            placeholder="Child node title..."
            value={childTitle}
            onChange={(e) => setChildTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateChild();
              if (e.key === 'Escape') {
                setIsCreatingChild(false);
                setChildTitle('');
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateChild}
              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreatingChild(false);
                setChildTitle('');
              }}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Children (Recursive) */}
      {isExpanded && hasChildren && (
        <div className="ml-7 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              project={project}
              isExpanded={expandedNodes.has(child.id)}
              isSelected={isSelected && child.id === node.id}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;