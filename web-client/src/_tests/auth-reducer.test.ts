import { authReducer, initialAuthState, type AuthAction } from '#state/auth-reducer'
import { describe, it, expect } from 'vitest'

describe('authReducer', () => {
  it('should handle logi start', () => {
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
  })

  it('should handle LOGOUT', () => {
    const prevState = {
      ...initialAuthState,
      token: 'jwt123',
      isAuthenticated: true,
    }
    const state = authReducer(prevState, { type: 'logout' })
    expect(state.status==='is-authenticated').toBe(false)
    expect(state.token).toBeNull()
  })
})