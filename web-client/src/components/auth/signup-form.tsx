import React, { useState } from 'react'
import { useAuth } from '#hooks/use-auth'
import type { SignupRequest } from '#types/type'

interface SignupFormProps {
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { signup, state } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
      try {
        const data :SignupRequest = {email, password, username}
      await signup(data)
      onSuccess?.()
    } catch{
      console.log('error sigining up')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-3xl font-display text-neon-lime">Signup</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={state.status ==='is-loading'}
        className="w-full px-4 py-2 bg-dark-card text-white border-2 border-neon-cyan rounded"
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={state.status==='is-loading'}
        className="w-full px-4 py-2 bg-dark-card text-white border-2 border-neon-cyan rounded"
      />

      {state.error && <p className="text-red-500 text-sm">{state.status==='error'}</p>}

      <button
        type="submit"
        disabled={state.status==='is-loading'}
        className="w-full px-4 py-2 bg-neon-lime text-dark-bg font-bold rounded hover:opacity-90 disabled:opacity-50"
      >
        {state.status==='is-loading' ? '⏳ Signing up...' : 'Signup'}
      </button>
    </form>
  )
}