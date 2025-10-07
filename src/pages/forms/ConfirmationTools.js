import useAutosaveForm from '../../hooks/useAutosaveForm';
import FormRow from '../../components/FormRow';
import { useNavigate } from 'react-router-dom'
import { toolsCreate } from '../../services/api';

export default function ConfirmationTools() {
  const nav = useNavigate()
  const { values, setField, reset } = useAutosaveForm('draft_tools', {
    orientationDate: '', orientationTime: '09:00',
    wheelbarrow: false, hoe: false, rake: false, gloves: 'M', shovel: false,
    safetyWaiverAccepted: false, toolPickupLocation: 'Shed A', remarks: ''
  })

  const next = async (e) => {
    e.preventDefault();
    try {
      await toolsCreate(values)
      nav('/form/feedback')
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="card">
      <h2>Confirmation & Tools</h2>
      <form onSubmit={next}>
        <div className="grid-3">
          <FormRow label="Orientation Date"><input type="date" value={values.orientationDate} onChange={e=>setField('orientationDate', e.target.value)} /></FormRow>
          <FormRow label="Orientation Time"><input type="time" value={values.orientationTime} onChange={e=>setField('orientationTime', e.target.value)} /></FormRow>
          <FormRow label="Tool Pickup Location">
            <select value={values.toolPickupLocation} onChange={e=>setField('toolPickupLocation', e.target.value)}>
              <option>Shed A</option><option>Shed B</option><option>Office</option>
            </select>
          </FormRow>
        </div>

        <div className="grid-3">
          <label className="check"><input type="checkbox" checked={values.wheelbarrow} onChange={e=>setField('wheelbarrow', e.target.checked)} /> Wheelbarrow</label>
          <label className="check"><input type="checkbox" checked={values.hoe} onChange={e=>setField('hoe', e.target.checked)} /> Hoe</label>
          <label className="check"><input type="checkbox" checked={values.rake} onChange={e=>setField('rake', e.target.checked)} /> Rake</label>
          <label className="check"><input type="checkbox" checked={values.shovel} onChange={e=>setField('shovel', e.target.checked)} /> Shovel</label>
        </div>

        <FormRow label="Glove Size">
          <select value={values.gloves} onChange={e=>setField('gloves', e.target.value)}>
            <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option>
          </select>
        </FormRow>

        <label className="check"><input type="checkbox" checked={values.safetyWaiverAccepted} onChange={e=>setField('safetyWaiverAccepted', e.target.checked)} /> I accept the safety waiver</label>

        <FormRow label="Remarks"><textarea rows={3} value={values.remarks} onChange={e=>setField('remarks', e.target.value)} /></FormRow>

        <div className="actions">
          <button className="btn">Next: Feedback</button>
          <button type="button" className="btn ghost" onClick={reset}>Clear Draft</button>
        </div>
      </form>
    </div>
  )
}
