import { FeedbackAPI } from '../../services/gardenService.js'
import { useMemo, useState } from 'react'

export default function FeedbackReport() {
  const [q,setQ] = useState('')
  const items = FeedbackAPI.list()
  const filtered = useMemo(()=> items.filter(i => 
    i.comments?.toLowerCase().includes(q.toLowerCase()) || 
    i.maintenanceType?.toLowerCase().includes(q.toLowerCase())
  ), [q, items])

  const avg = (items.reduce((s,i)=>s+Number(i.rating||0),0) / (items.length||1)).toFixed(1)

  return (
    <div>
      <h2>Feedback Summary</h2>
      <p>Average Rating: <strong>{avg}</strong> ({items.length} submissions)</p>
      <input className="input" placeholder="Search comments / type…" value={q} onChange={e=>setQ(e.target.value)} />
      <table className="table">
        <thead><tr><th>Rating</th><th>Type</th><th>Urgency</th><th>Comments</th><th>When</th></tr></thead>
        <tbody>
          {filtered.map(i=>(
            <tr key={i.id}>
              <td>{i.rating}</td>
              <td>{i.maintenanceType}</td>
              <td>{i.urgency}</td>
              <td>{i.comments}</td>
              <td>{new Date(i.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
