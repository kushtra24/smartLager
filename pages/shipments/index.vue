<script lang="ts" setup>
import PageTitle from '~/features/components/base/PageTitle.vue';
import BaseDatatable from '@/features/components/base/BaseDatatable.vue';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

const columns = [
  { field: 'id', header: $t('shipments.columns.id') },
  { field: 'status', header: $t('shipments.columns.status') },
  { field: 'created_at', header: $t('shipments.columns.createdAt') },
];
</script>

<template>
  <div>
    <PageTitle :title="$t('shipments.shipments')" />
    <Button v-slot="slotProps" asChild>
      <nuxt-link :to="$localePath('/shipments/addShipment')" v-bind="slotProps">{{$t('shipments.addShipment')}}</nuxt-link>
    </Button>

    <BaseDatatable resource-name="shipments" :columns="columns" />

  </div>
</template>
