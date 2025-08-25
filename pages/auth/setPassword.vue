<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="w-full max-w-md p-6 bg-white rounded shadow-md">
      <h1 class="text-2xl font-bold mb-4">{{ $t('auth.setPasswordTitle') }}</h1>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700">
            {{ $t('auth.newPassword') }}
          </label>
          <InputText
            id="password"
            v-model="password"
            type="password"
            class="w-full mt-1"
            :placeholder="$t('auth.newPasswordPlaceholder')"
          />
        </div>
        <div class="mb-4">
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
            {{ $t('auth.confirmPassword') }}
          </label>
          <InputText
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            class="w-full mt-1"
            :placeholder="$t('auth.confirmPasswordPlaceholder')"
          />
        </div>
        <Button
          label="{{ $t('auth.submit') }}"
          type="submit"
          class="w-full"
          :disabled="loading"
        />
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axiosClient from '@/axiosClient';

const route = useRoute();
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const token = ref('');
const email = ref('');

onMounted(() => {
  token.value = route.query.token as string || '';
  email.value = route.query.email as string || '';
});

const submitForm = async () => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match');
    return;
  }

  loading.value = true;
  try {
    await axiosClient.post('/api/set-password', {
      token: token.value,
      email: email.value,
      password: password.value
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
};
</script>