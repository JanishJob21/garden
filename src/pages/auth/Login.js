import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import GoogleLoginButton from '../../components/GoogleLoginButton'

export default function Login() {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [show,setShow] = useState(false)
  const [err,setErr] = useState('')
  const nav = useNavigate()
  const { login } = useAuth()

  const submit = async (e)=> {
    e.preventDefault()
    setErr('')
    try { await login({email,password}); nav('/dashboard') }
    catch (e) { setErr(e.message) }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      {err && <p className="error">{err}</p>}
      <form onSubmit={submit}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <div className="input-with-action">
          <input type={show? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} />
          <button type="button" className="btn ghost small" onClick={()=>setShow(s=>!s)}>{show? 'Hide' : 'Show'}</button>
        </div>
        <button className="btn">Login</button>
      </form>
      
      <div className="divider">or</div>
      <GoogleLoginButton />
      
      <div className="auth-footer">
        <Link to="/home" className="btn ghost">Back to Home</Link>
      </div>
    </div>
  )
}
