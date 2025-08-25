<template>
  <div>
    <div v-if="user">
      <h1 class="text-xl font-bold">{{ user.name }}</h1>
      <p class="text-gray-600">{{ user.email }}</p>
      <button
        class="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        @click="logoutUser"
      >
        Logout
      </button>
    </div>
    <div v-else>
      <SkeletonLoading />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosClient from '@/axiosClient';
import SkeletonLoading from '../../features/components/base/SkeletonLoading.vue';

const route = useRoute();
const router = useRouter();
const user = ref(null);
const { logout } = useAuth()

onMounted(async () => {
  const userId = route.params.id;
  try {
    const response = await axiosClient.get(`api/users/${userId}`);
    user.value = response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  }
});

async function logoutUser() {
  try {
    await logout();
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script>