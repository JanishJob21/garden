import { useAuth } from '../../context/AuthContext';
import { BookingsAPI } from '../../services/gardenService';
import { useEffect, useState } from 'react'

export default function MyBookings() {
  const { user } = useAuth()
  const [items,setItems] = useState([])

  useEffect(()=>{
    setItems(BookingsAPI.byUser(user.id))
  },[user])

  return (
    <div>
      <h2>My Bookings</h2>
      {items.length===0 ? <p>No bookings yet.</p> : (
        <table className="table">
          <thead><tr><th>Plot</th><th>Dates</th><th>Crop</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(b=>(
              <tr key={b.id}>
                <td>{b.plotId} ({b.plotSize})</td>
                <td>{b.startDate} → {b.endDate}</td>
                <td>{b.cropType}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
