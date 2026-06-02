import { useState, useEffect, useRef, useCallback } from 'react'

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    // Silencioso si el browser no lo soporta
  }
}

function vibrate() {
  try { navigator.vibrate?.([200, 100, 200]) } catch { /* noop */ }
}

export function useRestTimer(seconds = 45) {
  const [timeLeft, setTimeLeft]   = useState(null)  // null = inactivo
  const [running, setRunning]     = useState(false)
  const intervalRef               = useRef(null)
  const onDoneRef                 = useRef(null)

  const clear = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  const start = useCallback((duration = seconds, onDone) => {
    clear()
    onDoneRef.current = onDone
    setTimeLeft(duration)
    setRunning(true)
  }, [clear, seconds])

  const skip = useCallback(() => {
    clear()
    setRunning(false)
    setTimeLeft(null)
    onDoneRef.current?.()
    onDoneRef.current = null
  }, [clear])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          playBeep()
          vibrate()
          onDoneRef.current?.()
          onDoneRef.current = null
          return null
        }
        return prev - 1
      })
    }, 1000)
    return clear
  }, [running, clear])

  return { timeLeft, running, start, skip }
}
