<script lang="ts" setup>
import BaseDatatable from '@/features/components/base/BaseDatatable.vue';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

const columns = [
  { field: 'name', header: $t('products.columns.name') },
  { field: 'category', header: $t('products.columns.category') },
  { field: 'type', header: $t('products.columns.type') },
  { field: 'price', header: $t('products.columns.price') },
  { field: 'quantity', header: $t('products.columns.quantity') },
  { field: 'initialStock', header: $t('products.columns.stock') },
  { field: 'barcode', header: $t('products.columns.barcode') },
];

</script>

<template>
  <div>
    <Button v-slot="slotProps" asChild>
      <nuxt-link :to="$localePath('/products/addProduct')" v-bind="slotProps">{{ $t('addProduct.addButton') }}</nuxt-link>
    </Button>
    <BaseDatatable resource-name="products" :columns="columns" />
  </div>
</template>
