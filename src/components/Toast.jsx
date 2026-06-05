import { useEffect, useState } from 'react'

/**
 * Toast temporal que aparece 2.5 segundos y desaparece.
 *
 * Props:
 *   message  {string}   - Texto a mostrar
 *   onDone   {function} - Callback cuando termina (para limpiar el estado en el padre)
 */
export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      onDone?.()
    }, 2500)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                    bg-slate-700 border border-slate-600 text-slate-100
                    text-sm font-medium px-5 py-3 rounded-2xl shadow-xl
                    animate-fade-in whitespace-nowrap">
      {message}
    </div>
  )
}
