import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, 'name too short'),
  email: z.string().email('invalid email'),
  password: z.string().min(6, 'password must be atleast 6 chars')
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'password required')
})

export { signupSchema, loginSchema }
