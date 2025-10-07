export default function debounce(fn, delay=500) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(()=>fn(...args), delay)
  }
}
