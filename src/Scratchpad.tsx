import { useState } from 'react'
import './scratchpad.css'

export function Scratchpad() {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')

  return <section className={`scratchpad ${open ? 'is-open' : ''}`}>
    <button type="button" className="scratchpad-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Close notes' : 'Open notes'} <small>(optional)</small></button>
    {open && <div className="scratchpad-panel">
      <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Type your math work here..." aria-label="Question notes"/>
      <button type="button" onClick={() => setNotes('')}>Clear notes</button>
    </div>}
  </section>
}
