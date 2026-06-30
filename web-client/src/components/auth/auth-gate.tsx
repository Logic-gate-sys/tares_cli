import React, { useState } from 'react'
import { useAuth } from '#hooks/use-auth'
import { LoginForm } from './login-form'
import { SignupForm } from './signup-form'

interface AuthGateProps {
  children: React.ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const { state } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  if (state.status==="is-authenticated") {
    return <>{children}</>
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-bg p-8">
      {mode === 'login' ? (
        <>
          <LoginForm onSuccess={() => {}} />
          <p className="mt-6 text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={() => setMode('signup')}
              className="text-neon-cyan underline hover:text-neon-lime"
            >
              Sign up
            </button>
          </p>
        </>
      ) : (
        <>
          <SignupForm onSuccess={() => {}} />
          <p className="mt-6 text-gray-400">
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-neon-cyan underline hover:text-neon-lime"
            >
              Log in
            </button>
          </p>
        </>
      )}
    </div>
  )
}

