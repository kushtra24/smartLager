<template>
  <div class="flex flex-col items-center justify-center w-full p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-md p-6 dark:bg-gray-800">
      <h2 class="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        {{ $t('auth.loginTitle') }}
      </h2>
      
      <form class="space-y-4" @submit.prevent="handleLogin">
        <div class="space-y-2">
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('auth.email') }}
          </label>
          <InputText 
            id="email" 
            v-model="email" 
            type="email" 
            class="w-full" 
            :placeholder="$t('auth.emailPlaceholder')"
            required
          />
        </div>
        
        <div class="space-y-2">
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('auth.password') }}
          </label>
          <Password id="password" required v-model="password" class="border-none w-full" toggle-mask :placeholder="$t('auth.passwordPlaceholder')" />
        </div>
        
        <div class="flex items-center">
          <Checkbox id="remember" v-model="remember" :binary="true" />
          <label for="remember" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            {{ $t('auth.rememberMe') }}
          </label>
        </div>
        
        <Button 
          type="submit" 
          :label="loading ? $t('auth.loggingIn') : $t('auth.login')" 
          :disabled="loading"
          class="w-full" 
        />
        
        <Message v-if="authError" severity="error" :closable="false" class="w-full">
          {{ authError }}
        </Message>
      </form>
      
    </div>

    <div v-if="isAuthenticated" class="mt-8 w-full max-w-md p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h3 class="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        {{ $t('auth.userInfo') }}
      </h3>
      <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-auto">
        <pre class="text-sm text-gray-800 dark:text-gray-300">{{ JSON.stringify(user, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

// Use our custom auth composable
const { login, user, isAuthenticated, loading, error: authError } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)

const handleLogin = async () => {
  try {
    const success = await login({
      email: email.value,
      password: password.value,
      remember: remember.value
    })
    
    if (success) {
      router.push('/')
    }
  } catch (err) {
    console.error('Login failed:', err)
  }
}
</script>

<style>

#password input {
  width: 100%;
}

</style>