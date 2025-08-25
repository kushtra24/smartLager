<template>
  <div>
    <AppHeader @toggle-drawer="drawerOpen = !drawerOpen" />
    <SideDrawer v-model:visible="drawerOpen" />
    <main class="pt-14">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '~/features/components/layout/AppHeader.vue';
import SideDrawer from '~/features/components/layout/SideDrawer.vue';

const drawerOpen = ref(false);
</script>

<style scoped>
main {
  min-height: 100vh;
  background: #f9fafb;
}
</style>
