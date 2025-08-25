<script lang="ts" setup>
import PageTitle from '@/features/components/base/PageTitle.vue';
import SuppliersForm from '@/features/suppliers/components/SuppliersForm.vue';
definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});
</script>

<template>
  <div>
    <PageTitle title="Add New Supplier" />
    <SuppliersForm />
  </div>
</template>