<script lang="ts" setup>
import PageTitle from '~/features/components/base/PageTitle.vue';
import BaseDatatable from '@/features/components/base/BaseDatatable.vue';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

const columns = [
  { field: 'companyName', header: $t('clients.columns.companyName') },
  { field: 'firstName', header: $t('clients.columns.firstName') },
  { field: 'lastName', header: $t('clients.columns.lastName') },
  { field: 'email', header: $t('clients.columns.email') },
  { field: 'phone', header: $t('clients.columns.phone') },
];
</script>

<template>
  <div>
    <PageTitle :title="$t('clients.clients')" />
    <Button v-slot="slotProps" asChild>
      <nuxt-link :to="$localePath('/clients/addClient')" v-bind="slotProps">{{$t('clients.addClient')}}</nuxt-link>
    </Button>
    <BaseDatatable resource-name="clients" :columns="columns" />
  </div>
</template>
