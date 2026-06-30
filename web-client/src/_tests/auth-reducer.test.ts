import { authReducer, initialAuthState, type AuthAction } from '#state/auth-reducer'
import { describe, it, expect } from 'vitest'

describe('Auth Reducer test: ', () => {
  it('should handle login start', () => {
    const state = authReducer(initialAuthState, { type: 'start' })
    expect(state.status==='is-loading').toBe(true)
    expect(state.error).toBeNull()
  })

  it('should handle login success', () => {
    const action: AuthAction = {
      type: 'success',
      payload: { token: 'jwt123', user: { id: '1', email: 'test@example.com',username:'someone' } },
    }
    const state = authReducer(initialAuthState, action)
    expect(state.status==='is-authenticated').toBe(true)
    expect(state.token).toBe('jwt123')
    expect(state.user?.email).toBe('test@example.com')
    expect(state.user?.username).toBe('someone')
  })

  it('should handle LOGOUT', () => {
    const prevState = {
        ...initialAuthState,
      token: 'jwt123',
    }
    const state = authReducer(prevState, { type: 'logout' })
    expect(state.status==='is-authenticated').toBe(false)
    expect(state.token).toBeNull()
  })
})