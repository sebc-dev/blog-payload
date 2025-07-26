'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Simple() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        minHeight: '100vh',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1>Test Boutons shadcn/ui - Outline vs Ghost</h1>
        <Button onClick={toggleTheme}>{isDark ? '☀️ Clair' : '🌙 Sombre'}</Button>
      </div>

      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          marginBottom: '1rem',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Comparaison Outline vs Ghost</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="outline">Bouton Outline</Button>
          <Button variant="ghost">Bouton Ghost</Button>
          <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
            ← Les deux doivent être différents !
          </span>
        </div>
      </div>

      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Tous les variants</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button>Défaut</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="destructive">Destructeur</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Fantôme</Button>
          <Button variant="link">Lien</Button>
        </div>
      </div>

      <div
        style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--muted)',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
        }}
      >
        <p>
          <strong>Mode actuel :</strong> {isDark ? 'Sombre' : 'Clair'}
        </p>
        <p>
          <strong>Border :</strong> var(--border) | <strong>Input :</strong> var(--input)
        </p>
      </div>
    </div>
  )
}
