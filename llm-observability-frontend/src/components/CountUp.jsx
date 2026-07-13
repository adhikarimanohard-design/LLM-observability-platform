import { useEffect, useRef, useState } from 'react'

export default function CountUp({ value, decimals = 0, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const start = prevValue.current
    const end = typeof value === 'number' ? value : 0
    const duration = 600
    const startTime = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * eased)
      if (progress < 1) requestAnimationFrame(tick)
      else prevValue.current = end
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <span>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}