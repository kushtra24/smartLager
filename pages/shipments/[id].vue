<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import axiosClient from '@/axiosClient';
import SkeletonLoading from '../../features/components/base/SkeletonLoading.vue';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const shipmentId = computed(() => route.params.id);
const selectedStatus = ref('');
const shipment = ref(null);
const loading = ref(true);
const statusOptions = ref([
  { label: t('shipments.status.pending'), value: 'pending' },
  { label: t('shipments.status.inShipment'), value: 'inShipment' },
  { label: t('shipments.status.shipped'), value: 'shipped' },
  { label: t('shipments.status.delivered'), value: 'delivered' }
]);

const shipmentStatus = computed(() => {
  return statusOptions.value.find(option => option.value === selectedStatus.value)?.label || '';
});

const fetchShipmentDetails = async () => {
  loading.value = true;
  try {
    const response = await axiosClient.get(`/api/shipments/${shipmentId.value}`);
    shipment.value = response.data;
  } catch (error) {
    console.error('Error fetching shipment details:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('shipments.fetchFailed'),
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (newStatus) => {
  try {
    await axiosClient.patch(`/api/shipments/${shipmentId.value}`, {
      status: newStatus.value
    });
    
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('shipments.statusUpdated'),
      life: 3000
    });
    
    shipment.value.status = newStatus;
  } catch (error) {
    console.error('Error updating status:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('shipments.updateStatusFailed'),
      life: 3000
    });
  }
};

const deleteShipment = async () => {
  try {
    await axiosClient.delete(`/api/shipments/${shipmentId.value}`);
    
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('shipments.deleteSuccess'),
      life: 3000
    });
    
    router.push('/shipments');
  } catch (error) {
    console.error('Error deleting shipment:', error);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t('shipments.deleteFailed'),
      life: 3000
    });
  }
};

const confirmDelete = () => {
  const confirm = window.confirm(t('shipments.confirmDelete'));
  if (confirm) {
    deleteShipment();
  }
};

onMounted(async () => {
  await fetchShipmentDetails();
  if (shipment.value) {
    selectedStatus.value = shipment.value.status || '';
  }
});

// Watch for changes in shipment to set the selectedStatus
watch(() => shipment.value, (newShipment) => {
  if (newShipment) {
    selectedStatus.value = newShipment.status || '';
  }
}, { immediate: true });
</script>

<template>
  <div class="p-4">
    <Toast />
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ t('shipments.details') }}</h1>
      <div class="flex gap-2">
        <NuxtLink 
          v-if="shipment && shipment.invoice_id" 
          :to="`/invoices/${shipment.invoice_id}`" 
          class="p-button p-component bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          <i class="pi pi-file-pdf mr-2"></i>
          {{ t('shipments.viewInvoice') }}
        </NuxtLink>
        <Button
          @click="confirmDelete" 
          severity="danger" 
          :label="t('shipments.delete')" 
          icon="pi pi-trash"
        />
      </div>
    </div>
    
    <Card v-if="loading" class="p-4">
      <template #content>
        <SkeletonLoading />
      </template>
    </Card>
    
    <div v-else-if="shipment" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card class="p-4">
        <template #title>{{ t('shipments.shipmentInfo') }}</template>
        <template #content>          
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2">{{ t('shipments.date') }}:</h3>
            <p>{{ new Date(shipment.shipment_date).toLocaleDateString() }}</p>
          </div>
          
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2">{{ t('shipments.status') }}: {{ shipmentStatus }}</h3>
            <Select
              v-model="selectedStatus"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              @change="updateStatus(selectedStatus)"
              class="w-full md:w-auto"
            />
          </div>
        </template>
      </Card>
      
      <Card class="p-4">
        <template #title>{{ t('clients.clientDetails') }}</template>
        <template #content>
          <div v-if="shipment.client" class="mb-4">
            <h3 class="text-lg font-semibold mb-2">{{ t('clients.columns.companyName') }}:</h3>
            <p>{{ shipment.client.companyName }}</p>
          </div>
          <div v-else class="text-gray-500">
            {{ t('shipments.noClientInfo') }}
          </div>
        </template>
      </Card>
    </div>
    
    <div v-else class="text-center p-4">
      <p class="text-lg text-red-500">{{ t('shipments.notFound') }}</p>
      <Button 
        @click="router.push('/shipments')" 
        class="mt-4" 
        :label="t('common.back')"
        icon="pi pi-arrow-left"
      />
    </div>
  </div>
</template>