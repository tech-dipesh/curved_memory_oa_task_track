import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'
import { signupSchema, loginSchema } from '../validations/auth.validation.js'
const signup = async (req, res) => {
  const result = signupSchema.safeParse(req.body)
  if(!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message })
  }

  const { name, email, password } = result.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if(existing) return res.status(409).json({ message: 'email already in use' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed }
    })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const login = async (req, res) => {
  const result = loginSchema.safeParse(req.body)
  if(!result.success) {
    return res.status(400).json({ message: result.error.errors[0].message })
  }

  const { email, password } = result.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if(!user) return res.status(401).json({ message: 'invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if(!match) return res.status(401).json({ message: 'invalid credentials' })

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: 'server error' })
  }
}

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true }
    })
    res.json(user)
  } catch(err) {
    res.status(500).json({ message: 'server error' })
  }
}

export {signup, login, getMe}
