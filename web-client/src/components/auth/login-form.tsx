import React, { useState } from 'react'
import { useAuth } from '#hooks/use-auth'
import type { LoginRequest } from '#types/type'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, state } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.ChangeEvent) => {
    e.preventDefault()
      try {
      const lgdt:LoginRequest = {email, password}
      await login(lgdt)
      onSuccess?.()
    } catch  {
      console.log('errror loging in ')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-3xl font-display text-neon-pink">Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state.status ==='is-loading'}
        className="w-full px-4 py-2 bg-dark-card text-white border-2 border-neon-cyan rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={state.status==='is-loading'}
        className="w-full px-4 py-2 bg-dark-card text-white border-2 border-neon-cyan rounded"
      />

      {state.error && <p className="text-red-500 text-sm">{state.status==='error'}</p>}

      <button
        type="submit"
              disabled={state.status==='is-loading' }
        className="w-full px-4 py-2 bg-neon-pink text-dark-bg font-bold rounded hover:opacity-90 disabled:opacity-50"
      >
        {state.status==='is-loading' ? '⏳ Logging in...' : 'Login'}
      </button>
    </form>
  )
}