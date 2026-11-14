import { useEffect, useRef, useState, type PointerEvent } from 'react'
import './scratchpad.css'

export function Scratchpad() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'draw' | 'type'>('draw')
  const [notes, setNotes] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  const prepareCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const width = canvas.getBoundingClientRect().width
    const ratio = window.devicePixelRatio || 1
    canvas.width = width * ratio
    canvas.height = 140 * ratio
    const context = canvas.getContext('2d')
    context?.scale(ratio, ratio)
    if (context) { context.lineCap = 'round'; context.lineJoin = 'round'; context.lineWidth = 2.5; context.strokeStyle = '#197eb6' }
  }

  useEffect(() => {
    if (!open || mode !== 'draw') return
    const frame = window.requestAnimationFrame(prepareCanvas)
    return () => window.cancelAnimationFrame(frame)
  }, [mode, open])

  const point = (event: PointerEvent<HTMLCanvasElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top }
  }
  const startDrawing = (event: PointerEvent<HTMLCanvasElement>) => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); const context = event.currentTarget.getContext('2d'); const position = point(event); context?.beginPath(); context?.moveTo(position.x, position.y) }
  const draw = (event: PointerEvent<HTMLCanvasElement>) => { if (!drawing.current) return; const context = event.currentTarget.getContext('2d'); const position = point(event); context?.lineTo(position.x, position.y); context?.stroke() }
  const stopDrawing = () => { drawing.current = false }
  const clear = () => { if (mode === 'type') { setNotes(''); return }; const canvas = canvasRef.current; canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height) }

  return <section className={`scratchpad ${open ? 'is-open' : ''}`}>
    <button type="button" className="scratchpad-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}><span>✎</span>{open ? 'Close scratchpad' : 'Open scratchpad'}<small>Optional</small></button>
    {open && <div className="scratchpad-panel">
      <div className="scratchpad-toolbar"><div><button type="button" className={mode === 'draw' ? 'active' : ''} onClick={() => setMode('draw')}>Draw</button><button type="button" className={mode === 'type' ? 'active' : ''} onClick={() => setMode('type')}>Type</button></div><button type="button" onClick={clear}>Clear</button></div>
      {mode === 'draw' ? <canvas ref={canvasRef} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} aria-label="Drawing scratchpad"/> : <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Work through the calculation here…" aria-label="Typed scratchpad"/>}
      <p>Private working space · clears on the next question</p>
    </div>}
  </section>
}
