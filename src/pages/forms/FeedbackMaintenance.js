import useAutosaveForm from '../../hooks/useAutosaveForm';
import FormRow from '../../components/FormRow';
import { feedbackCreate } from '../../services/api';
import { useNavigate } from 'react-router-dom'

export default function FeedbackMaintenance() {
  const nav = useNavigate()
  const { values, setField, reset } = useAutosaveForm('draft_feedback', {
    rating: 5, comments: '', maintenanceType: 'None', photoUrl: '',
    hoursVolunteered: 0, urgency: 'Low', contactMethod: 'Email'
  })

  const submit = async (e) => {
    e.preventDefault()
    try {
      await feedbackCreate(values)
      reset()
      alert('Thanks for your feedback!')
      nav('/dashboard')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Feedback & Maintenance</h2>
      <form onSubmit={submit}>
        <div className="grid-3">
          <FormRow label="Rating (1-5)"><input type="number" min="1" max="5" value={values.rating} onChange={e=>setField('rating', Number(e.target.value))} /></FormRow>
          <FormRow label="Maintenance Type">
            <select value={values.maintenanceType} onChange={e=>setField('maintenanceType', e.target.value)}>
              <option>None</option><option>Water leak</option><option>Fence issue</option><option>Tool damage</option>
            </select>
          </FormRow>
          <FormRow label="Urgency">
            <select value={values.urgency} onChange={e=>setField('urgency', e.target.value)}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </FormRow>
        </div>

        <div className="grid-3">
          <FormRow label="Preferred Contact">
            <select value={values.contactMethod} onChange={e=>setField('contactMethod', e.target.value)}>
              <option>Email</option><option>Phone</option><option>SMS</option>
            </select>
          </FormRow>
          <FormRow label="Hours Volunteered"><input type="number" value={values.hoursVolunteered} onChange={e=>setField('hoursVolunteered', Number(e.target.value))} /></FormRow>
          <FormRow label="Photo URL (optional)"><input value={values.photoUrl} onChange={e=>setField('photoUrl', e.target.value)} /></FormRow>
        </div>

        <FormRow label="Comments"><textarea rows={4} value={values.comments} onChange={e=>setField('comments', e.target.value)} /></FormRow>

        <div className="actions">
          <button className="btn">Submit Feedback</button>
          <button type="button" className="btn ghost" onClick={reset}>Clear Draft</button>
        </div>
      </form>
    </div>
  )
}
