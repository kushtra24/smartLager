<script lang="ts" setup>
import AddProductForm from '~/features/products/components/AddProductForm.vue';
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

</script>

<template>
  <div>
    <AddProductForm />
  </div>
</template>
