export type ConversationStage =
  | 'DISCOVERY'
  | 'CLARIFICATION'
  | 'FEATURE_STRUCTURING'
  | 'VALIDATION'
  | 'BLUEPRINT_GENERATION'

export type ProjectStatus =
  | 'MATCHING'
  | 'READY_TO_SELECT'
  | 'DEVELOPER_ASSIGNED'
  | 'IN_DEVELOPMENT'
  | 'TESTING'
  | 'COMPLETED'

export interface Blueprint {
  startup_summary: string
  problem_statement: string
  target_users: string
  core_features: string[]
  special_requests?: string[]
  complexity_level: 'low' | 'medium' | 'high'
  estimated_timeline_days: number
  estimated_cost_range: {
    budget: { min: number; max: number }
    premium: { min: number; max: number }
    currency: 'INR'
  }
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}