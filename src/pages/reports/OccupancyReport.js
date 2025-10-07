import { PlotsAPI, BookingsAPI } from '../../services/gardenService.js'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function OccupancyReport() {
  const plots = PlotsAPI.list()
  const bookings = BookingsAPI.list().filter(b=>b.status==='Approved')
  const occupiedIds = new Set(bookings.map(b=>b.plotId))
  const occupied = plots.filter(p=>occupiedIds.has(p.id)).length
  const available = plots.length - occupied
  const data = [{name:'Occupied', value: occupied}, {name:'Available', value: available}]

  return (
    <div>
      <h2>Plot Occupancy</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={120} label />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p>Total Plots: {plots.length} • Approved Bookings: {bookings.length}</p>
    </div>
  )
}
