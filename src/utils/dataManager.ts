import { v4 as uuidv4 } from 'uuid';
import { Node, Project, CreateNodeInput, UpdateNodeInput, NodeStatus } from '../types';

const STORAGE_KEY = 'chronicle_projects';

export const loadProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
};

export const saveProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects:', error);
  }
};

export const createProject = (name: string, description?: string): Project => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name,
    description,
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
    nodes: []
  };
};

export const updateProjectAccess = (project: Project): Project => {
  return {
    ...project,
    lastAccessedAt: new Date().toISOString()
  };
};

export const createNode = (input: CreateNodeInput): Node => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title: input.title,
    status: input.status || 'untried',
    parentId: input.parentId,
    childIds: [],
    createdAt: now,
    updatedAt: now
  };
};

export const updateNode = (node: Node, updates: UpdateNodeInput): Node => {
  return {
    ...node,
    ...updates,
    updatedAt: new Date().toISOString()
  };
};

export const addNodeToProject = (project: Project, node: Node): Project => {
  const updatedNodes = [...project.nodes, node];
  
  if (node.parentId) {
    const parentIndex = updatedNodes.findIndex(n => n.id === node.parentId);
    if (parentIndex !== -1) {
      updatedNodes[parentIndex] = {
        ...updatedNodes[parentIndex],
        childIds: [...updatedNodes[parentIndex].childIds, node.id]
      };
    }
  }
  
  return {
    ...project,
    nodes: updatedNodes,
    updatedAt: new Date().toISOString()
  };
};

export const updateNodeInProject = (
  project: Project, 
  nodeId: string, 
  updates: UpdateNodeInput
): Project => {
  const nodeIndex = project.nodes.findIndex(n => n.id === nodeId);
  if (nodeIndex === -1) return project;
  
  const updatedNodes = [...project.nodes];
  updatedNodes[nodeIndex] = updateNode(updatedNodes[nodeIndex], updates);
  
  return {
    ...project,
    nodes: updatedNodes,
    updatedAt: new Date().toISOString()
  };
};

export const deleteNodeFromProject = (project: Project, nodeId: string): Project => {
  const nodeToDelete = project.nodes.find(n => n.id === nodeId);
  if (!nodeToDelete) return project;
  
  const idsToDelete = new Set<string>([nodeId]);
  const collectDescendants = (id: string) => {
    const node = project.nodes.find(n => n.id === id);
    if (node) {
      node.childIds.forEach(childId => {
        idsToDelete.add(childId);
        collectDescendants(childId);
      });
    }
  };
  collectDescendants(nodeId);
  
  let updatedNodes = project.nodes.filter(n => !idsToDelete.has(n.id));
  
  if (nodeToDelete.parentId) {
    const parentIndex = updatedNodes.findIndex(n => n.id === nodeToDelete.parentId);
    if (parentIndex !== -1) {
      updatedNodes[parentIndex] = {
        ...updatedNodes[parentIndex],
        childIds: updatedNodes[parentIndex].childIds.filter(id => id !== nodeId)
      };
    }
  }
  
  return {
    ...project,
    nodes: updatedNodes,
    updatedAt: new Date().toISOString()
  };
};

export const moveNode = (
  project: Project, 
  nodeId: string, 
  newParentId: string | null
): Project => {
  const node = project.nodes.find(n => n.id === nodeId);
  if (!node) return project;
  
  if (newParentId === nodeId) return project;
  if (newParentId && isDescendant(project, nodeId, newParentId)) return project;
  
  let updatedNodes = [...project.nodes];
  
  if (node.parentId) {
    const oldParentIndex = updatedNodes.findIndex(n => n.id === node.parentId);
    if (oldParentIndex !== -1) {
      updatedNodes[oldParentIndex] = {
        ...updatedNodes[oldParentIndex],
        childIds: updatedNodes[oldParentIndex].childIds.filter(id => id !== nodeId)
      };
    }
  }
  
  const nodeIndex = updatedNodes.findIndex(n => n.id === nodeId);
  updatedNodes[nodeIndex] = {
    ...updatedNodes[nodeIndex],
    parentId: newParentId,
    updatedAt: new Date().toISOString()
  };
  
  if (newParentId) {
    const newParentIndex = updatedNodes.findIndex(n => n.id === newParentId);
    if (newParentIndex !== -1) {
      updatedNodes[newParentIndex] = {
        ...updatedNodes[newParentIndex],
        childIds: [...updatedNodes[newParentIndex].childIds, nodeId]
      };
    }
  }
  
  return {
    ...project,
    nodes: updatedNodes,
    updatedAt: new Date().toISOString()
  };
};

const isDescendant = (project: Project, nodeId: string, targetId: string): boolean => {
  const node = project.nodes.find(n => n.id === nodeId);
  if (!node) return false;
  
  for (const childId of node.childIds) {
    if (childId === targetId) return true;
    if (isDescendant(project, childId, targetId)) return true;
  }
  
  return false;
};

export const getRootNodes = (project: Project): Node[] => {
  return project.nodes.filter(n => n.parentId === null);
};

export const searchNodes = (project: Project, query: string): Node[] => {
  const lowerQuery = query.toLowerCase();
  return project.nodes.filter(node => {
    return (
      node.title.toLowerCase().includes(lowerQuery) ||
      node.hypothesis?.toLowerCase().includes(lowerQuery) ||
      node.method?.toLowerCase().includes(lowerQuery) ||
      node.results?.toLowerCase().includes(lowerQuery) ||
      node.analysis?.toLowerCase().includes(lowerQuery) ||
      node.nextSteps?.toLowerCase().includes(lowerQuery)
    );
  });
};

export const getNodesByStatus = (project: Project, status: NodeStatus): Node[] => {
  return project.nodes.filter(n => n.status === status);
};

export const getProjectStats = (project: Project) => {
  const total = project.nodes.length;
  const byStatus = {
    untried: project.nodes.filter(n => n.status === 'untried').length,
    'in-progress': project.nodes.filter(n => n.status === 'in-progress').length,
    success: project.nodes.filter(n => n.status === 'success').length,
    failed: project.nodes.filter(n => n.status === 'failed').length,
    abandoned: project.nodes.filter(n => n.status === 'abandoned').length,
    blocked: project.nodes.filter(n => n.status === 'blocked').length
  };
  
  return { total, byStatus };
};