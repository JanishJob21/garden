import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Signup() {
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [role,setRole] = useState('Member')
  const [err,setErr] = useState('')
  const nav = useNavigate()
  const { signup } = useAuth()

  const submit = async (e)=> {
    e.preventDefault()
    setErr('')
    try { await signup({name,email,password,role}); nav('/dashboard') }
    catch(e){ setErr(e.message) }
  }

  return (
    <div className="card">
      <h2>Signup</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <label>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option>Member</option><option>Manager</option><option>Admin</option>
        </select>
        <button className="btn">Create Account</button>
      </form>
      <div className="auth-footer">
        <Link to="/home" className="btn ghost">Back to Home</Link>
      </div>
    </div>
  )
}
