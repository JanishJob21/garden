import { useEffect, useMemo, useState } from 'react'
import { usersList } from '../../services/api'
import { IconSearch, IconRefresh } from '../../components/Icons'

export default function Users() {
  const [users,setUsers] = useState([])
  const [err,setErr] = useState('')
  const [search,setSearch] = useState('')
  const [role,setRole] = useState('All')
  const [page,setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    (async () => {
      try {
        const { users } = await usersList()
        // Normalize role to capitalized for UI
        setUsers(users.map(u => ({ ...u, role: (u.role || '').charAt(0).toUpperCase() + (u.role || '').slice(1) })))
      } catch (e) { setErr(e.message) }
    })()
  }, [])

  // Role change handler - currently not used
  // const change = async (id, role) => {
  //   try {
  //     const { user } = await usersUpdateRole(id, role.toLowerCase())
  //     setUsers(prev => prev.map(u => u._id===user._id || u.id===user.id ? { ...user, role: (user.role || '').charAt(0).toUpperCase() + (user.role || '').slice(1) } : u))
  //   } catch (e) { setErr(e.message) }
  // }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users
      .filter(u => role==='All' || String(u.role)===role)
      .filter(u => !search || [u.name, u.email, u.role].some(v => String(v||'').toLowerCase().includes(q)))
  }, [users, search, role])

  const paged = useMemo(()=>{
    const start = (page-1)*pageSize
    return filtered.slice(start, start+pageSize)
  }, [filtered, page])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>User Management</h2>
      </div>
      {err && <p className="error">{err}</p>}
      <div className="card">
        <div className="row" style={{ display:'flex', gap:8, alignItems:'center' }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:8 }}>
            <IconSearch />
            <input placeholder="Search users..." value={search} onChange={e=>{setSearch(e.target.value); setPage(1)}} />
          </div>
          <select style={{ width:180 }} value={role} onChange={e=>{setRole(e.target.value); setPage(1)}}>
            <option>All</option>
            <option>Member</option>
            <option>Manager</option>
            <option>Admin</option>
          </select>
          <button className="btn ghost" onClick={()=>{setSearch(''); setRole('All'); setPage(1)}}><IconRefresh /> Clear</button>
        </div>
        <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 10px', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(u=>(
              <tr key={u._id || u.id} style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <td style={{ padding: '16px', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>{u.name}</td>
                <td style={{ padding: '16px' }}>{u.email}</td>
                <td style={{ padding: '16px' }}>
                  <span className={`badge ${String(u.role).toLowerCase()}`} style={{ 
                    display: 'inline-block',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: u.role === 'Admin' ? '#e0f2fe' : u.role === 'Manager' ? '#f0fdf4' : '#f5f5f4',
                    color: u.role === 'Admin' ? '#0369a1' : u.role === 'Manager' ? '#15803d' : '#44403c',
                    fontWeight: '500',
                    fontSize: '0.875rem'
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: '16px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center" style={{ padding: '24px' }}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="pagination" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
          <button className="btn ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page === 1}>Previous</button>
          <span className="hint" style={{ fontSize: '0.875rem', color: '#6b7280' }}>Page {page} of {totalPages}</span>
          <button className="btn ghost" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page >= totalPages}>Next</button>
        </div>
      </div>
    </div>
  )
}
