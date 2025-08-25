<template>
  <div>
    <PageTitle :title="$t('shipments.addShipment')" />
    <ShipmentForm />
  </div>
</template>

<script lang="ts" setup>
import ShipmentForm from '@/features/shipment/components/ShipmentForm.vue';
import PageTitle from '../../features/components/base/PageTitle.vue';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

</script>