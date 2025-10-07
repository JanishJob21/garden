export function seedIfEmpty() {
  if (!localStorage.getItem('gs_users')) {
    const admin = { id: crypto.randomUUID(), name: 'Admin', email: 'admin@garden.com', password: 'admin', role: 'Admin' }
    const manager = { id: crypto.randomUUID(), name: 'Manager', email: 'manager@garden.com', password: 'manager', role: 'Manager' }
    const member = { id: crypto.randomUUID(), name: 'Member', email: 'member@garden.com', password: 'member', role: 'Member' }
    localStorage.setItem('gs_users', JSON.stringify([admin, manager, member]))
  }
  if (!localStorage.getItem('gs_plots')) {
    const plots = Array.from({length: 24}).map((_,i)=>({
      id: `P${(i+1).toString().padStart(2,'0')}`,
      size: ['Small','Medium','Large'][i%3],
      hasWater: i%2===0,
      isOrganicOnly: i%4===0,
    }))
    localStorage.setItem('gs_plots', JSON.stringify(plots))
  }
  if (!localStorage.getItem('gs_bookings')) {
    localStorage.setItem('gs_bookings', JSON.stringify([]))
  }
  if (!localStorage.getItem('gs_feedback')) {
    localStorage.setItem('gs_feedback', JSON.stringify([]))
  }
}
