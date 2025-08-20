import  { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  onSet: (iso: string | undefined) => void
  initial?: string
}

export default function ScheduleDialog({ open, onClose, onSet, initial }: Props) {
  const [date, setDate] = useState<string>(initial ? initial.slice(0, 10) : '')
  const [time, setTime] = useState<string>(initial ? initial.slice(11, 16) : '')

  const apply = () => {
    if (!date || !time) { onSet(undefined); onClose(); return }
    onSet(new Date(`${date}T${time}:00`).toISOString())
    onClose()
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur z-[999] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-green-500/30 bg-gray-950 p-4 space-y-3">
        <div className="text-sm font-semibold">Agendar envio</div>
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                 className="rounded-md border border-green-500/20 bg-black p-2 text-sm" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                 className="rounded-md border border-green-500/20 bg-black p-2 text-sm" />
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-md border border-green-500/20 text-gray-300 hover:bg-green-500/10">
            Cancelar
          </button>
          <button onClick={apply} className="px-3 py-1.5 rounded-md bg-green-500 text-black font-semibold hover:bg-green-400">
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}
