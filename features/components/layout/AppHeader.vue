<template>
  <header class="flex items-center h-14 px-4 bg-white shadow z-10 print:hidden">
    <font-awesome
:icon="['fas', 'bars']" class="mr-4 text-xl cursor-pointer"  aria-label="Open navigation menu"
      tabindex="0"
      role="button"
      @click="$emit('toggle-drawer')" />
    <h1 class="text-lg font-bold">{{ t('app.title') }}</h1>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
header {
  position: sticky;
  top: 0;
}
</style>
