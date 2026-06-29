import  { useState } from 'react'

function App() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleTestConnection = async () => {
    setStatus('connecting')
    try {
      // Test API call to the Go backend
      const response = await fetch('http://localhost:8081/api/health', {
        method: 'GET',
      })
      
      if (response.ok) {
        setStatus('connected')
        setMessage('✅ Connected to backend!')
      } else {
        setStatus('error')
        setMessage('❌ Backend responded, but with an error.')
      }
    } catch (error) {
      setStatus('error')
      setMessage(`❌ Cannot reach backend. Is the Go server running on :8081? ${String(error)}`)
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-bg p-8">
      <h1 className="text-display-lg font-display text-neon-pink mb-4 text-outline">
        TARES
      </h1>
      
      <p className="text-xl text-neon-cyan mb-8 max-w-md text-center">
        Real-time multiplayer word scramble. Instant. Brutal. Beautiful.
      </p>

      <button
        onClick={handleTestConnection}
        disabled={status === 'connecting'}
        className={`px-8 py-4 text-lg font-bold rounded-lg transition-all mb-6 ${
          status === 'connected'
            ? 'bg-neon-lime text-dark-bg'
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-neon-pink text-white hover:bg-opacity-90'
        }`}
      >
        {status === 'connecting' ? '⏳ Testing...' : '🧪 Test Backend Connection'}
      </button>

      {message && (
        <p className={`text-center max-w-md ${status === 'connected' ? 'text-neon-lime' : 'text-red-400'}`}>
          {message}
        </p>
      )}

      <div className="mt-12 text-center text-sm text-gray-400">
        <p>Dev server: http://localhost:5173</p>
        <p>Go backend: http://localhost:8081</p>
      </div>
    </div>
  )
}

export default App