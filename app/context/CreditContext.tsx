'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface CreditContextType {
  creditBalance: number
  updateCredits: (amount: number) => void
}

const CreditContext = createContext<CreditContextType | undefined>(undefined)

export function CreditProvider({ children }: { children: ReactNode }) {
  const [creditBalance, setCreditBalance] = useState(100) // Default starting credits

  const updateCredits = (amount: number) => {
    setCreditBalance(prev => Math.max(0, prev + amount))
  }

  return (
    <CreditContext.Provider value={{ creditBalance, updateCredits }}>
      {children}
    </CreditContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditContext)
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider')
  }
  return context
}