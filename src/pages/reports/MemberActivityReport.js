import { BookingsAPI } from '../../services/gardenService.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MemberActivityReport() {
  const bookings = BookingsAPI.list()
  const byMember = bookings.reduce((acc,b)=>{
    const k = b.memberName || 'Unknown'
    acc[k] = (acc[k]||0) + 1
    return acc
  }, {})
  const data = Object.entries(byMember).map(([name,count])=>({ name, count }))

  return (
    <div>
      <h2>Member Activity</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /><YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
