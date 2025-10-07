import { useMemo, useState } from 'react'
import { BookingsAPI } from '../../services/gardenService.js'

export default function Approvals() {
  const [items,setItems] = useState(BookingsAPI.list())

  const pending = useMemo(()=> items.filter(b=>b.status==='Pending'), [items])

  const approve = (id, status) => {
    const next = BookingsAPI.update(id, { status })
    setItems(next)
  }

  return (
    <div>
      <h2>Manager Approvals</h2>
      {pending.length===0 ? <p>No pending bookings.</p> : (
        <table className="table">
          <thead><tr><th>Member</th><th>Plot</th><th>Dates</th><th>Crop</th><th>Action</th></tr></thead>
          <tbody>
            {pending.map(b=>(
              <tr key={b.id}>
                <td>{b.memberName}</td>
                <td>{b.plotId}</td>
                <td>{b.startDate} → {b.endDate}</td>
                <td>{b.cropType}</td>
                <td>
                  <button className="btn" onClick={()=>approve(b.id,'Approved')}>Approve</button>
                  <button className="btn ghost" onClick={()=>approve(b.id,'Rejected')}>Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
