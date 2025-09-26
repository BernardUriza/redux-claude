// src/app/page.tsx
// Redux Brain Medical System - Redirect to Main Interface
'use client'

import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/paradigm2')
}
