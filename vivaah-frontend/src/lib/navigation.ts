export interface NavItem {
  label: string
  path: (weddingId: string) => string
  accessLevels: string[]
  isAI?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Home',
    path: (id) => `/wedding/${id}`,
    accessLevels: ['planner_full', 'head_planner', 'full', 'budget', 'task', 'view_only', 'guest', 'couple_view', 'family_view'],
  },
  {
    label: 'Madhu',
    path: (id) => `/wedding/${id}/assistant`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
    isAI: true,
  },
  {
    label: 'Vendors',
    path: (id) => `/wedding/${id}/vendors`,
    accessLevels: ['planner_full', 'head_planner', 'full', 'budget', 'view_only'],
  },
  {
    label: 'Briefings',
    path: (id) => `/wedding/${id}/briefings`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
    isAI: true,
  },
  {
    label: 'Timeline',
    path: (id) => `/wedding/${id}/timeline`,
    accessLevels: ['head_planner', 'full'],
    isAI: true,
  },
  {
    label: 'Budget',
    path: (id) => `/wedding/${id}/budget`,
    accessLevels: ['head_planner', 'full', 'budget'],
  },
  {
    label: 'Payments',
    path: (id) => `/wedding/${id}/payments`,
    accessLevels: ['planner_full', 'head_planner', 'full', 'budget'],
  },
  {
    label: 'Tracker',
    path: (id) => `/wedding/${id}/tracker`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
  },
  {
    label: 'Participants',
    path: (id) => `/wedding/${id}/participants`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
  },
]
