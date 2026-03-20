export type ConversationStage =
  | 'DISCOVERY'
  | 'CLARIFICATION'
  | 'FEATURE_STRUCTURING'
  | 'VALIDATION'
  | 'BLUEPRINT_GENERATION'

export type ProjectStatus =
  | 'MATCHING'
  | 'DEVELOPER_ASSIGNED'
  | 'IN_DEVELOPMENT'
  | 'TESTING'
  | 'COMPLETED'

export interface Blueprint {
  startup_summary: string
  problem_statement: string
  target_users: string
  core_features: string[]
  suggested_tech_stack: string[]
  complexity_level: 'low' | 'medium' | 'high'
  estimated_timeline_days: number
  estimated_cost_range: { min: number; max: number }
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}