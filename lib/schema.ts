import { z } from 'zod'

export const BlueprintSchema = z.object({
  startup_summary: z.string().min(10),
  problem_statement: z.string().min(10),
  target_users: z.string().min(5),
  core_features: z.array(z.string()).min(2).max(8),
  suggested_tech_stack: z.array(z.string()).min(1),
  complexity_level: z.enum(['low', 'medium', 'high']),
  estimated_timeline_days: z.number().min(7).max(365),
  estimated_cost_range: z.object({
    budget: z.object({
      min: z.number().positive(),
      max: z.number().positive(),
    }),
    premium: z.object({
      min: z.number().positive(),
      max: z.number().positive(),
    }),
    currency: z.literal('INR'),
  }),
})

export type BlueprintType = z.infer<typeof BlueprintSchema>