import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional()
})

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional()
})

export { createTaskSchema, updateTaskSchema }
