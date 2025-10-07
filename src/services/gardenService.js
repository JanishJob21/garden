export const storage = {
  get(key, fallback) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)) },
}

export const UsersAPI = {
  list: () => storage.get('gs_users', []),
  updateRole: (id, role) => {
    const users = storage.get('gs_users', [])
    const next = users.map(u => u.id===id? {...u, role}: u)
    storage.set('gs_users', next)
    return next
  }
}

export const PlotsAPI = {
  list: () => storage.get('gs_plots', []),
}

export const BookingsAPI = {
  list: () => storage.get('gs_bookings', []),
  create: (booking) => {
    const all = storage.get('gs_bookings', [])
    const next = [...all, { ...booking, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
    storage.set('gs_bookings', next); return next
  },
  update: (id, patch) => {
    const all = storage.get('gs_bookings', [])
    const next = all.map(b => b.id===id? {...b, ...patch}: b)
    storage.set('gs_bookings', next); return next
  },
  byUser: (userId) => storage.get('gs_bookings', []).filter(b => b.userId===userId),
}

export const FeedbackAPI = {
  list: () => storage.get('gs_feedback', []),
  create: (fb) => {
    const all = storage.get('gs_feedback', [])
    const next = [...all, { ...fb, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]
    storage.set('gs_feedback', next); return next
  }
}
