'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Singleton to manage auth state across components
let authState: {
  user: User | null
  loading: boolean
  initialized: boolean
  listeners: Set<(user: User | null, loading: boolean) => void>
} = {
  user: null,
  loading: true,
  initialized: false,
  listeners: new Set()
}

let subscription: any = null

const initializeAuth = async () => {
  if (authState.initialized) return

  const supabase = createClient()
  
  try {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession()
    const newUser = session?.user ?? null
    
    // Only update if user actually changed
    if (JSON.stringify(authState.user) !== JSON.stringify(newUser)) {
      authState.user = newUser
      authState.loading = false
      authState.initialized = true
      
      // Notify all listeners
      authState.listeners.forEach(listener => listener(authState.user, authState.loading))
    }
    
    // Listen for auth changes only if not already listening
    if (!subscription) {
      subscription = supabase.auth.onAuthStateChange(
        async (event, session) => {
          const newUser = session?.user ?? null
          
          // Only update if user actually changed
          if (JSON.stringify(authState.user) !== JSON.stringify(newUser)) {
            console.log('Auth state change:', event, newUser?.email)
            authState.user = newUser
            authState.loading = false
            
            // Notify all listeners
            authState.listeners.forEach(listener => listener(authState.user, authState.loading))
          }
        }
      )
    }
  } catch (error) {
    console.error('Error getting session:', error)
    authState.user = null
    authState.loading = false
    authState.initialized = true
    
    // Notify all listeners
    authState.listeners.forEach(listener => listener(authState.user, authState.loading))
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(authState.user)
  const [loading, setLoading] = useState(authState.loading)
  const supabase = createClient()

  useEffect(() => {
    // Initialize auth if not already done
    initializeAuth()
    
    // Add this component as a listener
    const listener = (newUser: User | null, newLoading: boolean) => {
      setUser(newUser)
      setLoading(newLoading)
    }
    
    authState.listeners.add(listener)
    
    // Set initial state
    setUser(authState.user)
    setLoading(authState.loading)
    
    return () => {
      authState.listeners.delete(listener)
      
      // Clean up subscription if no more listeners
      if (authState.listeners.size === 0 && subscription) {
        subscription.data.subscription.unsubscribe()
        subscription = null
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
  }
} 