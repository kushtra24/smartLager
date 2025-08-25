<script lang="ts" setup>
import PageTitle from '~/features/components/base/PageTitle.vue';
import BaseDatatable from '@/features/components/base/BaseDatatable.vue';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

const columns = [
  { field: 'name', header: $t('users.columns.name') },
  { field: 'email', header: $t('users.columns.email') },
  { field: 'created_at', header: $t('users.columns.createdAt') },
];

</script>

<template>
  <div>
    <PageTitle :title="$t('users.users')" />
    <BaseDatatable resource-name="users" :columns="columns" />
  </div>
</template>