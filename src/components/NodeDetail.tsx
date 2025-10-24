import React, { useState, useEffect } from 'react';
import { Node, Project, NodeStatus, STATUS_LABELS, STATUS_COLORS } from '../types';
import { updateNodeInProject } from '../utils/dataManager';
import { format } from 'date-fns';

interface NodeDetailProps {
  node: Node;
  project: Project;
  onUpdateProject: (project: Project) => void;
  onClose: () => void;
}

const NodeDetail: React.FC<NodeDetailProps> = ({
  node,
  project,
  onUpdateProject,
  onClose
}) => {
  const [title, setTitle] = useState(node.title);
  const [status, setStatus] = useState(node.status);
  const [hypothesis, setHypothesis] = useState(node.hypothesis || '');
  const [method, setMethod] = useState(node.method || '');
  const [results, setResults] = useState(node.results || '');
  const [analysis, setAnalysis] = useState(node.analysis || '');
  const [nextSteps, setNextSteps] = useState(node.nextSteps || '');

  // Reset form when node changes
  useEffect(() => {
    setTitle(node.title);
    setStatus(node.status);
    setHypothesis(node.hypothesis || '');
    setMethod(node.method || '');
    setResults(node.results || '');
    setAnalysis(node.analysis || '');
    setNextSteps(node.nextSteps || '');
  }, [node.id]);

  const handleSave = () => {
    const updates = {
      title: title.trim() || node.title,
      status,
      hypothesis: hypothesis.trim() || undefined,
      method: method.trim() || undefined,
      results: results.trim() || undefined,
      analysis: analysis.trim() || undefined,
      nextSteps: nextSteps.trim() || undefined
    };

    const updatedProject = updateNodeInProject(project, node.id, updates);
    onUpdateProject(updatedProject);
  };

  // Auto-save on blur
  const handleBlur = () => {
    handleSave();
  };

  const allStatuses: NodeStatus[] = [
    'untried',
    'in-progress',
    'success',
    'failed',
    'abandoned',
    'blocked'
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-gray-900">Node Details</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as NodeStatus);
              // Save immediately on status change
              setTimeout(() => handleSave(), 0);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <div className={`mt-2 inline-block px-3 py-1 rounded text-sm ${STATUS_COLORS[status]}`}>
            {STATUS_LABELS[status]}
          </div>
        </div>

        {/* Hypothesis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hypothesis
            <span className="text-gray-400 font-normal ml-1">(Why try this?)</span>
          </label>
          <textarea
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            onBlur={handleBlur}
            placeholder="I think this will work because..."
            className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Method
            <span className="text-gray-400 font-normal ml-1">(What did you do?)</span>
          </label>
          <textarea
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            onBlur={handleBlur}
            placeholder="Steps taken, approach used..."
            className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Results */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Results
            <span className="text-gray-400 font-normal ml-1">(What happened?)</span>
          </label>
          <textarea
            value={results}
            onChange={(e) => setResults(e.target.value)}
            onBlur={handleBlur}
            placeholder="Data, observations, outcomes..."
            className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Analysis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Analysis
            <span className="text-gray-400 font-normal ml-1">(Why did it work/fail?)</span>
          </label>
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            onBlur={handleBlur}
            placeholder="Insights, reasons, learnings..."
            className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        {/* Next Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Next Steps
            <span className="text-gray-400 font-normal ml-1">(What to try next?)</span>
          </label>
          <textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            onBlur={handleBlur}
            placeholder="Ideas, follow-up questions..."
            className="w-full px-3 py-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
          <div>
            <strong>Created:</strong> {format(new Date(node.createdAt), 'PPp')}
          </div>
          <div>
            <strong>Updated:</strong> {format(new Date(node.updatedAt), 'PPp')}
          </div>
          <div>
            <strong>ID:</strong> {node.id}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NodeDetail;