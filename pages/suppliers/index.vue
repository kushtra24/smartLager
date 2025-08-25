<script lang="ts" setup>
import BaseDatatable from '@/features/components/base/BaseDatatable.vue';
import { useLocalePath } from '#i18n';
import { useI18n } from 'vue-i18n';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});


const columns = [
  { field: 'name', header: 'Name' },
  { field: 'email', header: 'Email' },
  { field: 'phone', header: 'Phone' },
];

const localePath = useLocalePath();
const { t } = useI18n();
</script>

<template>
  <div>
    <Button v-slot="slotProps" asChild>
      <nuxt-link :to="localePath('/suppliers/addSuppliers')" v-bind="slotProps">{{ t('suppliers.addSupplier') }}</nuxt-link>
    </Button>
    
    <BaseDatatable
      :resource-name="'suppliers'"
      :columns="columns"
    />
  </div>
</template>
