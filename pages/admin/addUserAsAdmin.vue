<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Add User as Admin</h1>
    <Toast />
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <InputText 
          id="name"
          v-model="form.name"
          type="text"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter user name"
          required
        />
      </div>
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <InputText 
          id="email"
          v-model="form.email"
          type="email"
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter user email"
          required
        />
      </div>
      <div class="flex justify-end">
        <button
          type="submit"
          class="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :disabled="loading"
        >
          Add User
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import axiosClient from '@/axiosClient';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
  requiresAdmin: true
});

const toast = useToast();
const loading = ref(false);
const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const submitForm = async () => {

  try {
    await axiosClient.post('/api/users', form.value);
    toast.add({ severity: 'success', summary: 'Success', detail: 'User added successfully', life: 3000 });
    form.value = { name: '', email: '', password: '', password_confirmation: '' }; // Reset form
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: error.response?.data?.message || 'Failed to add user', life: 3000 });
  } finally {
  }
};
</script>
