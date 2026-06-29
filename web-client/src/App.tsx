import { AuthProvider } from './state/context/auth-context'
import { AuthGate } from '#components/auth/auth-gate'
import { Arena } from '#components/game/arena'


function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <Arena />
      </AuthGate>
    </AuthProvider>
  )
}

export default App