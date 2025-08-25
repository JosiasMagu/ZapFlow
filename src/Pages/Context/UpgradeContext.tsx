// src/Pages/Context/UpgradeContext0.tsx
import  { createContext, useContext, useState, type ReactNode } from 'react'

type Feature = 'bot' | 'flow' | 'broadcast' | 'advanced'

type UpgradeContextValue = {
  isOpen: boolean
  sourceFeature?: Feature
  open: (from?: Feature) => void
  close: () => void
}

const UpgradeContext = createContext<UpgradeContextValue | null>(null)

export function UpgradeProvider({ children }: { children?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [sourceFeature, setSourceFeature] = useState<Feature | undefined>()

  const open = (from?: Feature) => {
    setSourceFeature(from)
    setIsOpen(true)
  }
  const close = () => setIsOpen(false)

  return (
    <UpgradeContext.Provider value={{ isOpen, sourceFeature, open, close }}>
      {children}
    </UpgradeContext.Provider>
  )
}

export function useUpgrade() {
  const ctx = useContext(UpgradeContext)
  if (!ctx) {
    throw new Error('useUpgrade deve ser usado dentro de <UpgradeProvider />')
  }
  return ctx
}
