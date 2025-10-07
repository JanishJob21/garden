import { useEffect, useState } from 'react'
import { sessionsList, sessionsDelete } from '../../services/api'
import { IconSearch, IconRefresh, IconClear } from '../../components/Icons'
import Breadcrumbs from '../../components/Breadcrumbs'

export default function Sessions() {
  const [items,setItems] = useState([])
  const [total,setTotal] = useState(0)
  const [err,setErr] = useState('')
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState(null)
  const [selectedSessions, setSelectedSessions] = useState([])
  const pageSize = 10

  const load = async (opts = {}) => {
    try {
      setErr('')
      const { items, total } = await sessionsList({
        q,
        status: status === 'All' ? '' : status,
        page,
        pageSize,
        ...opts
      })
      setItems(items)
      setTotal(total)
      // Clear selection when data changes
      setSelectedSessions([])
    } catch (e) { 
      setErr(e.message) 
    }
  }

  useEffect(()=>{ load() // initial
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  useEffect(()=>{ load() // reload when page changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[page])

  const clearFilters = () => {
    setQ('')
    setStatus('All')
    setPage(1)
    load({ page: 1 })
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const formatDur = (sec) => {
    const m = Math.floor(sec/60), s = sec%60
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  const handleDelete = async (id) => {
    if (!id && selectedSessions.length === 0) {
      setErr('Please select at least one session to delete')
      return
    }

    const idsToDelete = id ? [id] : selectedSessions
    const message = `Are you sure you want to delete ${idsToDelete.length} selected session(s)? This action cannot be undone.`
    
    if (!window.confirm(message)) {
      return
    }
    
    try {
      setDeleting(idsToDelete)
      // Delete all selected sessions
      await Promise.all(idsToDelete.map(sessionId => sessionsDelete(sessionId)))
      // Reload the sessions after successful deletion
      load()
    } catch (error) {
      setErr(error.message || 'Failed to delete session(s)')
    } finally {
      setDeleting(null)
    }
  }

  const toggleSelectSession = (id) => {
    setSelectedSessions(prev => 
      prev.includes(id) 
        ? prev.filter(sessionId => sessionId !== id)
        : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedSessions.length === items.length) {
      setSelectedSessions([])
    } else {
      setSelectedSessions(items.map(session => session._id))
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Session Management</h2>
        <button 
          className="btn danger"
          onClick={() => handleDelete()}
          disabled={selectedSessions.length === 0}
        >
          Delete Selected
        </button>
      </div>
      {err && <p className="error">{err}</p>}

      <div className="card">
        <div className="filters">
          <div className="search-box">
            <IconSearch />
            <input 
              type="text" 
              placeholder="Search by username or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <div className="filter-actions">
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Logged Out">Logged Out</option>
            </select>
            <button 
              className="btn"
              onClick={() => load()}
            >
              Search
            </button>
            <button 
              className="btn ghost"
              onClick={clearFilters}
            >
              <IconRefresh /> Clear
            </button>
          </div>
        </div>

        <div className="table-responsive" style={{ marginTop: '20px' }}>
          <table className="table" style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', padding: '12px 16px' }}>
                  <input 
                    type="checkbox" 
                    checked={items.length > 0 && selectedSessions.length === items.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={{ padding: '12px 16px' }}>Username</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Login Time</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((session) => (
                  <tr key={session._id} style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <td style={{ padding: '16px', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                      <input 
                        type="checkbox"
                        checked={selectedSessions.includes(session._id)}
                        onChange={() => toggleSelectSession(session._id)}
                        style={{ margin: '0' }}
                      />
                    </td>
                    <td style={{ padding: '16px' }}>{session.username || '-'}</td>
                    <td style={{ padding: '16px' }}>{session.email || '-'}</td>
                    <td style={{ padding: '16px' }}>{new Date(session.loginAt).toLocaleString()}</td>
                    <td style={{ padding: '16px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                      <span className={`chip ${session.status === 'Active' ? 'chip-success' : 'chip-muted'}`} style={{ padding: '6px 12px', borderRadius: '20px' }}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                      <td colSpan="5" className="text-center" style={{ padding: '24px' }}>No sessions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button 
            className="btn ghost" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span className="hint">
            Page {page} of {totalPages}
          </span>
          <button 
            className="btn ghost" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
