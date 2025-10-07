import useAutosaveForm from '../../hooks/useAutosaveForm';
import FormRow from '../../components/FormRow';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { registrationsCreate } from '../../services/api';

export default function MemberRegistration() {
  const { user } = useAuth()
  const nav = useNavigate()
  const { values, setField, reset } = useAutosaveForm('draft_register', {
    memberName: user?.name || '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    age: '', gender: 'Prefer not to say', experience: 'Beginner',
    preferredTime: 'Morning', emergencyName: '', emergencyPhone: '',
    consent: false, newsletter: true,
    idProofUrl: '', gardenRulesAccepted: false,
    toolsTraining: 'No', disabilitySupport: 'No', notes: ''
  })

  const next = async (e)=> {
    e.preventDefault()
    if (!values.memberName || !values.email) return alert('Name and Email required')
    try {
      await registrationsCreate(values)
      nav('/form/booking')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Member Registration</h2>
      <form onSubmit={next}>
        <FormRow label="Full Name">
          <input value={values.memberName} onChange={e=>setField('memberName', e.target.value)} />
        </FormRow>
        <FormRow label="Email">
          <input value={values.email} onChange={e=>setField('email', e.target.value)} />
        </FormRow>
        <FormRow label="Phone">
          <input value={values.phone} onChange={e=>setField('phone', e.target.value)} />
        </FormRow>
        <FormRow label="Address">
          <input value={values.address} onChange={e=>setField('address', e.target.value)} />
        </FormRow>
        <div className="grid-3">
          <FormRow label="City"><input value={values.city} onChange={e=>setField('city', e.target.value)} /></FormRow>
          <FormRow label="State"><input value={values.state} onChange={e=>setField('state', e.target.value)} /></FormRow>
          <FormRow label="PIN Code"><input value={values.pincode} onChange={e=>setField('pincode', e.target.value)} /></FormRow>
        </div>
        <div className="grid-3">
          <FormRow label="Age"><input type="number" value={values.age} onChange={e=>setField('age', e.target.value)} /></FormRow>
          <FormRow label="Gender">
            <select value={values.gender} onChange={e=>setField('gender', e.target.value)}>
              <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
            </select>
          </FormRow>
          <FormRow label="Experience">
            <select value={values.experience} onChange={e=>setField('experience', e.target.value)}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </FormRow>
        </div>
        <div className="grid-3">
          <FormRow label="Preferred Time">
            <select value={values.preferredTime} onChange={e=>setField('preferredTime', e.target.value)}>
              <option>Morning</option><option>Afternoon</option><option>Evening</option>
            </select>
          </FormRow>
          <FormRow label="Emergency Contact Name"><input value={values.emergencyName} onChange={e=>setField('emergencyName', e.target.value)} /></FormRow>
          <FormRow label="Emergency Contact Phone"><input value={values.emergencyPhone} onChange={e=>setField('emergencyPhone', e.target.value)} /></FormRow>
        </div>
        <div className="grid-3">
          <FormRow label="ID Proof URL (optional)"><input value={values.idProofUrl} onChange={e=>setField('idProofUrl', e.target.value)} /></FormRow>
          <FormRow label="Tools Training"><select value={values.toolsTraining} onChange={e=>setField('toolsTraining', e.target.value)}><option>No</option><option>Yes</option></select></FormRow>
        </div>

        <label className="check"><input type="checkbox" checked={values.newsletter} onChange={e=>setField('newsletter', e.target.checked)} /> Subscribe to newsletter</label>
        <label className="check"><input type="checkbox" checked={values.disabilitySupport==='Yes'} onChange={e=>setField('disabilitySupport', e.target.checked?'Yes':'No')} /> Require accessibility support</label>
        <label className="check"><input type="checkbox" checked={values.gardenRulesAccepted} onChange={e=>setField('gardenRulesAccepted', e.target.checked)} /> I accept the garden rules</label>
        <label className="check"><input type="checkbox" checked={values.consent} onChange={e=>setField('consent', e.target.checked)} /> Consent to data usage</label>

        <FormRow label="Notes"><textarea value={values.notes} onChange={e=>setField('notes', e.target.value)} rows={3} /></FormRow>

        <div className="actions">
          <button className="btn">Next: Plot Booking</button>
          <button type="button" className="btn ghost" onClick={reset}>Clear Draft</button>
        </div>
      </form>
    </div>
  )
}
