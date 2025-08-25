<script lang="ts" setup>
defineProps<{
  title: string
}>();
</script>

<template>
<h1 class="text-2xl font-bold"> {{ title }} </h1>
<div class="border-b border-gray-200 dark:border-gray-700 mb-8 mt-2"></div>
</template>