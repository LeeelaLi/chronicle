export type NodeStatus = 
  | 'untried' 
  | 'in-progress' 
  | 'success' 
  | 'failed' 
  | 'abandoned' 
  | 'blocked';

export interface Node {
  id: string;
  title: string;
  status: NodeStatus;
  
  hypothesis?: string;
  method?: string;
  results?: string;
  analysis?: string;
  resources?: string[];
  nextSteps?: string;

  createdAt: string;
  updatedAt: string;
  
  parentId: string | null;
  childIds: string[];
  
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  nodes: Node[];
}

export interface CreateNodeInput {
  title: string;
  parentId: string | null;
  status?: NodeStatus;
}

export interface UpdateNodeInput {
  title?: string;
  status?: NodeStatus;
  hypothesis?: string;
  method?: string;
  results?: string;
  analysis?: string;
  resources?: string[];
  nextSteps?: string;
  tags?: string[];
}

export const STATUS_COLORS: Record<NodeStatus, string> = {
  'untried': 'bg-blue-100 text-blue-800 border-blue-300',
  'in-progress': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'success': 'bg-green-100 text-green-800 border-green-300',
  'failed': 'bg-red-100 text-red-800 border-red-300',
  'abandoned': 'bg-gray-100 text-gray-800 border-gray-300',
  'blocked': 'bg-orange-100 text-orange-800 border-orange-300'
};

export const STATUS_LABELS: Record<NodeStatus, string> = {
  'untried': 'Untried',
  'in-progress': 'In Progress',
  'success': 'Success',
  'failed': 'Failed',
  'abandoned': 'Abandoned',
  'blocked': 'Blocked'
};

export const STATUS_ICONS: Record<NodeStatus, string> = {
  'untried': '🔵',
  'in-progress': '🔬',
  'success': '✅',
  'failed': '❌',
  'abandoned': '⚫',
  'blocked': '🚧'
};