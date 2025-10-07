import { useEffect, useRef, useState } from 'react'
import debounce from '../utils/debounce.js'

export default function useAutosaveForm(key, initial) {
  const [values, setValues] = useState(() => {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : initial
  })
  const saver = useRef(debounce((v)=>localStorage.setItem(key, JSON.stringify(v)), 600))

  useEffect(()=> { saver.current(values) }, [values])

  const setField = (name, value) => setValues(v => ({ ...v, [name]: value }))
  const reset = () => { localStorage.removeItem(key); setValues(initial) }

  return { values, setField, reset, setValues }
}
