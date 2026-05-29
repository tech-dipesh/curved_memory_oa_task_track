import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  return (
    <div className="min-h-screen">
      <nav className="h-14 flex items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-6">
          <span className="text-[18px] font-bold text-blue-500">TaskTracker</span>
          <NavLink to="/" end className={({ isActive }) => `text-[14px] ${isActive ? 'text-indigo-500' : 'text-[#555]'}`}>Dashboard</NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `text-[14px] ${isActive ? 'text-indigo-500' : 'text-[#555]'}`}>Tasks</NavLink>
          <NavLink to="/summary" className={({ isActive }) => `text-[14px] ${isActive ? 'text-indigo-500' : 'text-[#555]'}`}>Summary</NavLink>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-[#777]">hi, {user?.name}</span>
          <button onClick={handleLogout} className="bg-[#f3f4f6] text-[#333] px-3 py-1.25 text-[13px] rounded-md">
            Logout
          </button>
        </div>
      </nav>
      <main className="p-6 max-w-275 mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
