// plugins/auth.ts
export default defineNuxtPlugin(async () => {
  // Only run on client-side
  if (import.meta.client) {
    const { fetchUser, token } = useAuth()
    
    // Try to restore token from localStorage if available
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      token.value = storedToken
      
      try {
        // Try to fetch user data with the stored token
        const userData = await fetchUser()
        if (userData) {
          console.log('User authenticated from stored token')
        }
      } catch (error) {
        console.error('Failed to restore authentication from token:', error)
        // Clear invalid token
        localStorage.removeItem('auth_token')
        token.value = null
      }
    }
  }
})
