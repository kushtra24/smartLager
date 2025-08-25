// plugins/auth-auto-import.ts
export default defineNuxtPlugin(() => {
  return {
    provide: {
      auth: useAuth()
    }
  }
})
