'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function ShadcnThemeTest() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* En-tête avec toggle de thème */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0,
          }}
        >
          Test d&apos;intégration shadcn/ui + Thème personnalisé
        </h1>
        <Button onClick={toggleTheme}>{isDark ? '☀️ Mode Clair' : '🌙 Mode Sombre'}</Button>
      </div>

      {/* Test des variantes de boutons shadcn/ui */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'var(--foreground)',
          }}
        >
          Composants Button shadcn/ui
        </h2>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <Button variant="default">Bouton par défaut</Button>
          <Button variant="secondary">Bouton secondaire</Button>
          <Button variant="destructive">Bouton destructif</Button>
          <Button variant="outline">Bouton contour</Button>
          <Button variant="ghost">Bouton fantôme</Button>
          <Button variant="link">Lien bouton</Button>
        </div>
      </div>

      {/* Test des tailles de boutons */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'var(--foreground)',
          }}
        >
          Tailles de boutons
        </h2>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button size="sm">Petit</Button>
          <Button size="default">Défaut</Button>
          <Button size="lg">Grand</Button>
          <Button size="icon">🎯</Button>
        </div>
      </div>

      {/* Test des couleurs du thème */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'var(--foreground)',
          }}
        >
          Variables CSS du thème
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {[
            { name: 'Primary', bg: 'var(--primary)', fg: 'var(--primary-foreground)' },
            { name: 'Secondary', bg: 'var(--secondary)', fg: 'var(--secondary-foreground)' },
            { name: 'Accent', bg: 'var(--accent)', fg: 'var(--accent-foreground)' },
            { name: 'Destructive', bg: 'var(--destructive)', fg: 'var(--destructive-foreground)' },
            { name: 'Muted', bg: 'var(--muted)', fg: 'var(--muted-foreground)' },
            { name: 'Card', bg: 'var(--card)', fg: 'var(--card-foreground)' },
          ].map((color) => (
            <div
              key={color.name}
              style={{
                padding: '1rem',
                backgroundColor: color.bg,
                color: color.fg,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                textAlign: 'center',
                fontWeight: '500',
              }}
            >
              {color.name}
            </div>
          ))}
        </div>
      </div>

      {/* Test des couleurs Chart */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: 'var(--foreground)',
          }}
        >
          Couleurs Chart
        </h2>

        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <div
              key={num}
              style={{
                width: '4rem',
                height: '4rem',
                backgroundColor: `var(--chart-${num})`,
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--background)',
                fontWeight: 'bold',
              }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Informations sur l'état du thème */}
      <div
        style={{
          padding: '1rem',
          backgroundColor: 'var(--muted)',
          color: 'var(--muted-foreground)',
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem',
        }}
      >
        <p>
          <strong>Mode actuel :</strong> {isDark ? 'Sombre' : 'Clair'}
        </p>
        <p>
          <strong>Radius :</strong> var(--radius)
        </p>
        <p>
          <strong>Background :</strong> var(--background)
        </p>
        <p>
          <strong>Primary :</strong> var(--primary)
        </p>
      </div>
    </div>
  )
}
