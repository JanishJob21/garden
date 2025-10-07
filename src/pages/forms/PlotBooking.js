import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAutosaveForm from '../../hooks/useAutosaveForm';
import { PlotsAPI } from '../../services/gardenService';
import { bookingsCreate } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FormRow from '../../components/FormRow';

export default function PlotBooking() {
  const plots = PlotsAPI.list()
  const nav = useNavigate()
  useAuth() // User context is not currently used
  const { values, setField, reset } = useAutosaveForm('draft_booking', {
    plotId: '', plotSize: '', startDate: '', endDate: '',
    cropType: '', wateringFreq: 'Daily', compost: 'No', irrigationSlot: '06:00',
    shared: 'No', notes: '', toolKit: 'Basic', waterAccess: 'Auto',
  })

  const selectedPlot = useMemo(()=> plots.find(p=>p.id===values.plotId), [plots, values.plotId])

  const submit = async (e) => {
    e.preventDefault()
    if (!values.plotId || !values.startDate || !values.endDate) return alert('Select plot and dates')
    try {
      await bookingsCreate({ ...values })
      reset()
      nav('/form/confirm-tools')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Plot Booking</h2>
      <form onSubmit={submit}>
        <div className="grid-3">
          <FormRow label="Plot">
            <select value={values.plotId} onChange={e=>{ 
              const pid=e.target.value; 
              setField('plotId', pid); 
              const p = plots.find(x=>x.id===pid)
              if (p) setField('plotSize', p.size)
            }}>
              <option value="">-- Select --</option>
              {plots.map(p=><option key={p.id} value={p.id}>{p.id} ({p.size}) {p.hasWater?'💧':''} {p.isOrganicOnly?'Organic':''}</option>)}
            </select>
          </FormRow>
          <FormRow label="Plot Size">
            <input value={values.plotSize} onChange={e=>setField('plotSize', e.target.value)} placeholder="Auto-filled" />
          </FormRow>
          <FormRow label="Crop Type">
            <input value={values.cropType} onChange={e=>setField('cropType', e.target.value)} placeholder="e.g., Tomato" />
          </FormRow>
        </div>

        <div className="grid-3">
          <FormRow label="Start Date"><input type="date" value={values.startDate} onChange={e=>setField('startDate', e.target.value)} /></FormRow>
          <FormRow label="End Date"><input type="date" value={values.endDate} onChange={e=>setField('endDate', e.target.value)} /></FormRow>
          <FormRow label="Irrigation Slot (HH:MM)"><input type="time" value={values.irrigationSlot} onChange={e=>setField('irrigationSlot', e.target.value)} /></FormRow>
        </div>

        <div className="grid-3">
          <FormRow label="Watering Frequency">
            <select value={values.wateringFreq} onChange={e=>setField('wateringFreq', e.target.value)}>
              <option>Daily</option><option>Alternate</option><option>Twice a week</option>
            </select>
          </FormRow>
          <FormRow label="Compost Required">
            <select value={values.compost} onChange={e=>setField('compost', e.target.value)}>
              <option>No</option><option>Yes</option>
            </select>
          </FormRow>
          <FormRow label="Water Access">
            <select value={values.waterAccess} onChange={e=>setField('waterAccess', e.target.value)}>
              <option>Auto</option><option>Manual</option>
            </select>
          </FormRow>
        </div>

        <div className="grid-2">
          <FormRow label="Shared Plot">
            <select value={values.shared} onChange={e=>setField('shared', e.target.value)}>
              <option>No</option><option>Yes</option>
            </select>
          </FormRow>
          <FormRow label="Tool Kit">
            <select value={values.toolKit} onChange={e=>setField('toolKit', e.target.value)}>
              <option>Basic</option><option>Standard</option><option>Advanced</option>
            </select>
          </FormRow>
        </div>

        <FormRow label="Notes"><textarea rows={3} value={values.notes} onChange={e=>setField('notes', e.target.value)} /></FormRow>

        {selectedPlot && <p className="hint">Selected: {selectedPlot.id} • Size: {selectedPlot.size} • Water: {selectedPlot.hasWater?'Yes':'No'} • {selectedPlot.isOrganicOnly?'Organic-only':''}</p>}

        <div className="actions">
          <button className="btn">Next: Confirmation & Tools</button>
          <button type="button" className="btn ghost" onClick={reset}>Clear Draft</button>
        </div>
      </form>
    </div>
  )
}
