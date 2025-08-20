import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react'

const AssistantButton: React.FC = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-green-500 text-black flex items-center justify-center shadow-lg hover:bg-green-400"
        aria-label="Assistente"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-[1000]">
          <div className="w-full max-w-md rounded-xl border border-green-500/30 bg-gray-950 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Assistente</div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">Fechar</button>
            </div>
            <div className="text-sm text-gray-300 space-y-2">
              <p>Olá! Posso ajudar com:</p>
              <ul className="list-disc list-inside">
                <li>Como criar um fluxo</li>
                <li>Como disparar uma campanha</li>
                <li>Planos e limites</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AssistantButton
