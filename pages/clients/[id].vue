<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SkeletonLoading from '../../features/components/base/SkeletonLoading.vue';
import axiosClient from '@/axiosClient';
import BaseDatatable from '../../features/components/base/BaseDatatable.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const clientId = computed(() => route.params.id);
const client = ref(null);
const loading = ref(true);
const error = ref(null);
const clientsInvoices = ref([]);

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true,
  isAdmin: true // Added isAdmin check
});

const fetchClientDetails = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Replace with your actual API endpoint
    const responds = await axiosClient(`/api/clients/${clientId.value}`);
    client.value = responds.data;

  } catch (e) {
    console.error('Error fetching client details:', e);
    error.value = e.message || t('common.unknownError');
  } finally {
    loading.value = false;
  }
};

const fetchClientsInvoices = async () => {
  try {
    const responds = await axiosClient(`/api/fetchAllInvoicesOfClient?clientId=${clientId.value}`);
    clientsInvoices.value = responds.data.data;
  } catch (e) {
    console.error('Error fetching client invoices:', e);
    error.value = e.message || t('common.unknownError');
  }
}

const goBack = () => {
  router.push('/clients');
};

const getClientTypeLabel = (type) => {
  return type === 'company' ? t('client.details.typeCompany') : t('client.details.typeIndividual');
};

onMounted(() => {
  fetchClientDetails();
});


const invoiceColumns = [
  { field: 'invoiceNumber', header: t('invoices.table.header.invoiceNumber') },
  { field: 'date', header: t('invoices.table.header.date') },
  { field: 'amount', header: t('invoices.table.header.amount') },
  { field: 'status', header: t('invoices.table.header.status') },
  { field: 'created_at', header: t('invoices.table.header.date') },
];
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ t('clients.clientDetails') }}</h1>
      <Button 
        icon="pi pi-arrow-left" 
        :label="t('common.back')" 
        class="p-button-secondary" 
        @click="goBack" 
      />
    </div>

    <SkeletonLoading v-if="loading" variant="small" />

    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded mb-4">
      <font-awesome :icon="['fas', 'exclamation']" />
      {{ error }}
    </div>

    <div v-else-if="client" class="card">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Client Overview Card -->
        <Card class="shadow-md">
          <template #title>
            <div class="flex items-center">
              <font-awesome :icon="['fas', 'user']" />
              {{ t('client.details.overview') }}
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="col-span-2 mb-2">
                <Badge :value="getClientTypeLabel(client.type)" severity="info" class="text-sm" />
              </div>
              
              <div v-if="client.companyName" class="col-span-2">
                <div class="text-sm text-gray-500">{{ t('client.form.companyName') }}</div>
                <div class="text-lg font-semibold">{{ client.companyName }}</div>
              </div>
              
              <div v-if="client.firstName">
                <div class="text-sm text-gray-500">{{ t('client.form.firstName') }}</div>
                <div>{{ client.firstName }}</div>
              </div>
              
              <div v-if="client.lastName">
                <div class="text-sm text-gray-500">{{ t('client.form.lastName') }}</div>
                <div>{{ client.lastName }}</div>
              </div>
              
              <div v-if="client.taxId">
                <div class="text-sm text-gray-500">{{ t('client.form.taxId') }}</div>
                <div>{{ client.taxId }}</div>
              </div>
              
              <div v-if="client.created_at">
                <div class="text-sm text-gray-500">{{ t('client.details.createdAt') }}</div>
                <div>{{ new Date(client.created_at).toLocaleDateString() }}</div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Contact Information Card -->
        <Card class="shadow-md">
          <template #title>
            <div class="flex items-center">
              <font-awesome :icon="['fas', 'envelope']" />
              {{ t('client.details.contactInfo') }}
            </div>
          </template>
          <template #content>
            <div class="grid grid-cols-1 gap-4">
              <div v-if="client.email">
                <div class="text-sm text-gray-500">{{ t('client.form.email') }}</div>
                <div class="flex items-center">
                  <font-awesome :icon="['fas', 'envelope']" />
                  <a :href="`mailto:${client.email}`" class="text-blue-600 hover:underline">{{ client.email }}</a>
                </div>
              </div>
              
              <div v-if="client.phone">
                <div class="text-sm text-gray-500">{{ t('client.form.phone') }}</div>
                <div class="flex items-center">
                  <font-awesome :icon="['fas', 'phone']" />
                  <a :href="`tel:${client.phone}`" class="text-blue-600 hover:underline">{{ client.phone }}</a>
                </div>
              </div>
            </div>
          </template>
        </Card>

        <!-- Notes Card -->
        <Card v-if="client.notes" class="shadow-md col-span-1 md:col-span-2">
          <template #title>
            <div class="flex items-center">
              <font-awesome :icon="['fas', 'comment']" />
              {{ t('client.form.notes') }}
            </div>
          </template>
          <template #content>
            <p class="whitespace-pre-line">{{ client.notes }}</p>
          </template>
        </Card>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end mt-6 gap-2">
        <Button 
          icon="pi pi-pencil" 
          :label="t('clients.editClient')" 
          class="p-button-primary" 
          @click="router.push(`/clients/edit/${client.id}`)" 
        />
        <Button 
          icon="pi pi-file" 
          :label="t('client.details.viewInvoices')" 
          class="p-button-secondary" 
          @click="fetchClientsInvoices" 
        />
      </div>

      <template v-if="clientsInvoices">
        <h2 class="text-xl font-semibold mt-6 mb-4">{{ t('client.details.invoices') }}</h2>
      <BaseDatatable :data="clientsInvoices" :columns="invoiceColumns" />
      </template>
      
    </div>

    <div v-else class="p-4 bg-yellow-50 text-yellow-700 rounded">
      {{ t('client.details.notFound') }}
    </div>
  </div>
</template>