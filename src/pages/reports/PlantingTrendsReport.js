import { BookingsAPI } from '../../services/gardenService.js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PlantingTrendsReport() {
  const bookings = BookingsAPI.list()
  const byCrop = bookings.reduce((acc,b)=>{
    if (!b.cropType) return acc
    acc[b.cropType] = (acc[b.cropType]||0) + 1
    return acc
  }, {})
  const data = Object.entries(byCrop).map(([crop,count])=>({ crop, count }))

  return (
    <div>
      <h2>Planting Trends</h2>
      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="crop" /><YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
