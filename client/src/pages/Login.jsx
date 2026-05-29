import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await login(email, password)
      nav('/')
    } catch(error) {
      setErr(error.response?.data?.message || 'login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
<div className="flex items-center justify-center min-h-screen">
  <div className="card w-90">
    <h2 className="mb-5 text-[22px]">Login</h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-3.5">
        <label className="text-[13px] block mb-1">Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="mb-4.5">
        <label className="text-[13px] block mb-1">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      {err && <p className="error-msg mb-2.5">{err}</p>}
      <button type="submit" className="btn-primary w-full p-2.5" disabled={loading}>
        {loading ? 'logging in...' : 'Login'}
      </button>
    </form>
    <p className="text-center mt-4 text-[13px]">
      dont have an account? <Link to="/signup" className="text-indigo-500">signup</Link>
    </p>
  </div>
</div>
  )
}
