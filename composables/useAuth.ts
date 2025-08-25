import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// Define user type
interface User {
  id: number
  name: string
  email: string
  [key: string]: unknown // Allow for additional properties
}

// Create a reactive state for authentication
const user = ref<User | null>(null)
const isAuthenticated = ref(false)
const isAnAdmin = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const token = ref<string | null>(null)

// Laravel API configuration
const API_BASE_URL = 'http://localhost:8000'
const API_ENDPOINTS = {
  csrf: '/sanctum/csrf-cookie',
  login: '/api/login',
  logout: '/api/logout',
  user: '/api/user',
  register: '/api/register'
}

export function useAuth() {
  const router = useRouter()

  /**
   * Get CSRF cookie for Laravel Sanctum
   */
  const getCsrfCookie = async () => {
    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.csrf}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
    } catch (err) {
      console.error('Failed to get CSRF cookie:', err)
    }
  }

  /**
   * Login user
   */
  const login = async (credentials: { email: string; password: string; remember?: boolean }) => {
    loading.value = true
    error.value = null

    try {
      // First, get the CSRF cookie
      await getCsrfCookie()
      
      // Small delay to ensure CSRF cookie is set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Then, attempt to login
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(credentials)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Login failed')
      }

      // Get token from response if it exists
      const data = await response.json()
      if (data.token) {
        token.value = data.token
        // Store token in localStorage for persistence
        if (import.meta.client) {
          localStorage.setItem('auth_token', data.token)
        }
      }

      // Set authenticated state
      isAuthenticated.value = true
      isAnAdmin.value = user.value?.isAdmin === true

      // Get user data after successful login
      // We're adding a small delay to ensure cookies are properly set
      await new Promise(resolve => setTimeout(resolve, 300))
      await fetchUser()
      
      return true
    } catch (err: Error | unknown) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch current user data
   */
  const fetchUser = async () => {
    loading.value = true
    error.value = null

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      };
      
      // Add Authorization header if token exists
      if (token.value) {
        headers['Authorization'] = `Bearer ${token.value}`;
      }
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.user}`, {
        method: 'GET',
        credentials: 'include',
        headers
      })

      if (!response.ok) {
        // If not authenticated, clear user state
        if (response.status === 401) {
          isAuthenticated.value = false
          user.value = null
          return null
        }
        throw new Error('Failed to fetch user data')
      }

      const userData = await response.json()
      user.value = userData
      isAuthenticated.value = true
      return userData
    } catch (err: Error | unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user data'
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    loading.value = true
    error.value = null

    try {
      await fetch(`${API_BASE_URL}${API_ENDPOINTS.logout}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      })

      // Clear auth state
      user.value = null
      isAuthenticated.value = false
      token.value = null
      
      // Remove token from localStorage
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
      }
      
      // Redirect to login page
      router.push('/auth/login')
      
      return true
    } catch (err: Error | unknown) {
      error.value = err instanceof Error ? err.message : 'Logout failed'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Register a new user
   */
  const register = async (userData: { name: string; email: string; password: string; password_confirmation: string }) => {
    loading.value = true
    error.value = null

    try {
      // First, get the CSRF cookie
      await getCsrfCookie()
      
      // Small delay to ensure CSRF cookie is set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.register}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Registration failed')
      }

      // Set authenticated state
      isAuthenticated.value = true
      
      // Get user data after successful registration
      await fetchUser()
      
      return true
    } catch (err: Error | unknown) {
      error.value = err instanceof Error ? err.message : 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Add a computed property to check if the user is an admin
  const isAdmin = computed(() => {
    isAnAdmin.value = user.value?.isAdmin === true;
  });

  return {
    user,
    isAuthenticated,
    isAnAdmin,
    loading,
    error,
    token,
    login,
    logout,
    fetchUser,
    register,
    isAdmin // Added isAdmin here
  }
}
