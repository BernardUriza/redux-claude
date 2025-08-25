// 🧠 Provider Redux para Cognitive Core
// Creado por Bernard Orozco

'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { createMedicalStore } from '../store'

// Store singleton
const medicalStore = createMedicalStore()

export interface MedicalProviderProps {
  children: React.ReactNode
}

export const MedicalProvider: React.FC<MedicalProviderProps> = ({ children }) => {
  return <Provider store={medicalStore}>{children}</Provider>
}

export default MedicalProvider
