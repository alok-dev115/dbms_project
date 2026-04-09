import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { login as apiLogin } from '../api'

const AuthContext = createContext(null)

function decodeJwtPayload(token) {
  if (!token) return null
  try {
    const part = token.split('.')[1]
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('access_token'))
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh_token'))

  const payload = useMemo(() => decodeJwtPayload(accessToken), [accessToken])

  const login = useCallback(async (username, password) => {
    const { data } = await apiLogin(username, password)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setAccessToken(data.access)
    setRefreshToken(data.refresh)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setAccessToken(null)
    setRefreshToken(null)
  }, [])

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken),
      isStaff: Boolean(payload?.is_staff),
      username: payload?.username ?? null,
      login,
      logout,
    }),
    [accessToken, refreshToken, payload, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
