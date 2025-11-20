import { z } from 'zod'

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  image: z.string().url('Invalid image URL').optional(),
})

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>

