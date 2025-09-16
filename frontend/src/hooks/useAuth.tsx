import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { authService } from '../services/authService'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken()
      const savedUser = authService.getUser()
      
      if (token && savedUser) {
        try {
          // Verify token is still valid
          const profile = await authService.getProfile()
          setUser(profile)
        } catch (error) {
          // Token expired or invalid
          authService.logout()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    const { token, user: authenticatedUser } = await authService.login({ username, password })
    authService.saveToken(token)
    authService.saveUser(authenticatedUser)
    setUser(authenticatedUser)
  }

  const register = async (username: string, password: string) => {
    const { token, user: registeredUser } = await authService.register({ username, password })
    authService.saveToken(token)
    authService.saveUser(registeredUser)
    setUser(registeredUser)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}