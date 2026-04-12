export interface NavItem {
  label: string
  path: (weddingId: string) => string
  accessLevels: string[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Vendors',
    path: (id) => `/wedding/${id}/vendors`,
    accessLevels: ['planner_full', 'head_planner', 'full', 'budget', 'view_only'],
  },
  {
    label: 'Payments',
    path: (id) => `/wedding/${id}/payments`,
    accessLevels: ['planner_full', 'head_planner', 'full', 'budget'],
  },
  {
    label: 'Budget',
    path: (id) => `/wedding/${id}/budget`,
    accessLevels: ['head_planner', 'full', 'budget'],
  },
  {
    label: 'Tracker',
    path: (id) => `/wedding/${id}/tracker`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
  },
  {
    label: 'Timeline',
    path: (id) => `/wedding/${id}/timeline`,
    accessLevels: ['head_planner', 'full'],
  },
  {
    label: 'Briefings',
    path: (id) => `/wedding/${id}/briefings`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
  },
  {
    label: 'Participants',
    path: (id) => `/wedding/${id}/participants`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
  },
  {
    label: 'Assistant',
    path: (id) => `/wedding/${id}/assistant`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
  },
  {
    label: 'Settings',
    path: (id) => `/wedding/${id}/settings`,
    accessLevels: ['planner_full', 'head_planner', 'full'],
  },
]
