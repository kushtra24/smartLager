// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // Skip middleware on server
  if (import.meta.server) return
  
  const { isAuthenticated, isAnAdmin } = useAuth()
  
  // If user is not authenticated and tries to access a protected route
  if (!isAuthenticated.value && to.meta.requiresAuth) {
    // Redirect to login page
    return navigateTo('/auth/login')
  }

  // if user tries to access an admin-only route
  if (!isAuthenticated.value && to.meta.requiresAdmin) {
    // Redirect to home page
    return navigateTo('/')
  }
  
  // If user is authenticated and tries to access guest-only routes (like login)
  if (isAuthenticated.value && to.meta.guestOnly) {
    // Redirect to home page
    return navigateTo('/')
  }
})
