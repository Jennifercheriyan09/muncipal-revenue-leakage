'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin } from './api'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('mrlis_token')
    if (stored) setToken(stored)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    localStorage.setItem('mrlis_token', res.access_token)
    setToken(res.access_token)
  }

  const logout = () => {
    localStorage.removeItem('mrlis_token')
    setToken(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
