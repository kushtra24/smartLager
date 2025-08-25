<script lang="ts" setup>
import PageTitle from '~/features/components/base/PageTitle.vue';
import BaseDatatable from '@/features/components/base/BaseDatatable.vue';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

const columns = [
  { field: 'invoice_number', header: $t('invoice.columns.invoiceNumber') },
  { field: 'client.companyName', header: $t('invoice.columns.clientName') },
  { field: 'date', header: $t('invoice.columns.date') },
  { field: 'total', header: $t('invoice.columns.total') },
  { field: 'status', header: $t('invoice.columns.status') },
];
</script>

<template>
  <div>
    <PageTitle :title="$t('invoice.invoices')" />
    <BaseDatatable resource-name="invoices" :columns="columns" />
  </div>
</template>
