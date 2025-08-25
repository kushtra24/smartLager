<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axiosClient from '@/axiosClient';
import SkeletonLoading from '../../features/components/base/SkeletonLoading.vue';
import { useToast } from 'primevue/usetoast';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

// Define the product type
interface Product {
  id: string;
  name: string;
  type: string;
  category: string;
  price: number;
  size: string;
  barcode: string;
  initialStock: number;
  unit: string;
  supplier: string;
  description: string;
  minStockLevel: number;
  location: string;
  expirationDate?: string;
  imageUrl?: string;
}

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const product = ref<Product | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const errors = ref<string[]>([]);
const isLoadingSuppliers = ref(false);

// Reuse options (translated) similar to AddProductForm
const categories = ref([
  { label: t('category.tools'), value: 'tools' },
  { label: t('category.consumables'), value: 'consumables' },
  { label: t('category.other'), value: 'other' },
]);
const units = ref([
  { label: t('unit.piece'), value: 'piece' },
  { label: t('unit.kg'), value: 'kg' },
  { label: t('unit.liter'), value: 'liter' },
]);

// Dynamic suppliers list
const suppliers = ref<{ label: string; value: string }[]>([]);

const fetchSuppliers = async () => {
  isLoadingSuppliers.value = true;
  try {
    const response = await axiosClient.get('/api/suppliers');
    suppliers.value = (response.data?.data || []).map((supplier: any) => ({
      label: supplier.name || supplier.companyName,
      value: String(supplier.id),
    }));
    if (product.value?.supplier && !suppliers.value.some(s => s.value === product.value?.supplier)) {
      if (product.value) product.value.supplier = '';
    }
  } catch (e) {
    console.error('Error fetching suppliers:', e);
    errors.value.push(t('addProduct.failedToLoadSuppliers'));
  } finally {
    isLoadingSuppliers.value = false;
  }
};

// Function to fetch product data
async function fetchProduct() {
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, you would fetch from an API using the ID
    const productId = route.params.id as string;
    // Replace this with your actual API call
    const response = await axiosClient.get(`/api/products/${productId}`);
    if (response.status !== 200) {
      throw new Error('Failed to fetch product data');
    }
    product.value = response.data;
    loading.value = false;
  } catch (err) {
    console.error('Error fetching product:', err);
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    
    // Mock data for demonstration purposes
    product.value = {
      id: route.params.id as string,
      name: 'Sample Product',
      type: 'Electronic',
      category: 'Tools',
      price: 99.99,
      size: '15cm x 10cm',
      barcode: 'PROD123456',
      initialStock: 100,
      unit: 'Piece',
      supplier: 'Supplier A',
      description: 'This is a sample product description that provides details about the product features and usage.',
      minStockLevel: 10,
      location: 'Aisle 5, Shelf B',
      expirationDate: '2025-12-31',
      imageUrl: 'https://placehold.co/400x300'
    };
    loading.value = false;
  }
}

function validateForm() {
  errors.value = [];
  if (!product.value) return false;
  if (!product.value.name?.trim()) errors.value.push(t('addProduct.nameRequired'));
  if (!product.value.type?.trim()) errors.value.push(t('addProduct.typeRequired'));
  if (!product.value.category) errors.value.push(t('addProduct.categoryRequired'));
  if (product.value.price === null || product.value.price === undefined || Number(product.value.price) <= 0)
    errors.value.push(t('addProduct.priceRequired'));
  return errors.value.length === 0;
}

async function submitForm(goBack = false) {
  if (!product.value) return;
  if (!validateForm()) return;
  try {
    const productId = route.params.id as string;
    const payload = {
      ...product.value,
      updatedAt: new Date().toISOString(),
    };
    const response = await axiosClient.patch(`/api/products/${productId}`, payload);
    product.value = response.data || payload;
    toast.add({
      severity: 'success',
      summary: t('common.success'),
      detail: t('products.updateSuccess'),
      life: 3000,
    });
    if (goBack) router.push('/products');
  } catch (e: any) {
    console.error('Update failed:', e);
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: e?.response?.data?.message || t('products.updateFailed'),
      life: 4000,
    });
  }
}

function saveAndFinish() {
  submitForm(true);
}

onMounted(() => {
  fetchProduct();
  fetchSuppliers();
});
</script>

<template>
  <div class="p-4 max-w-7xl mx-auto">
    <!-- Toast -->
    <Toast position="top-right" />
    <!-- ...existing code... -->

    <div v-if="loading">
      <SkeletonLoading />
    </div>

    <div v-else-if="error" class="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <p>{{ error }}</p>
      <Button @click="fetchProduct">{{ t('retry') || 'Retry' }}</Button>
    </div>

    <!-- Replace the read-only view with an editable form -->
    <div v-else-if="product" class="product-detail">
      <!-- Header with image preview -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8 border-b border-gray-200 pb-6">
        <div class="flex flex-col flex-1">
          <h1 class="text-2xl sm:text-4xl font-medium m-0 leading-tight">
            {{ product.name || t('addProduct.name') }}
          </h1>
          <span class="text-sm text-gray-500 mt-2">{{ product.barcode }}</span>
        </div>

        <div v-if="product.imageUrl" class="w-full h-[250px] sm:w-[300px] sm:h-[200px] bg-gray-100 flex items-center justify-center rounded-lg overflow-hidden">
          <img :src="product.imageUrl" :alt="product.name" class="max-w-full max-h-full object-contain" />
        </div>
        <div v-else class="w-full h-[250px] sm:w-[300px] sm:h-[200px] bg-gray-100 flex items-center justify-center rounded-lg text-gray-500">
          <span>{{ t('noImageAvailable') }}</span>
        </div>
      </div>

      <!-- Validation errors -->
      <div v-if="errors.length" class="mb-4">
        <ul class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          <li v-for="(err, idx) in errors" :key="idx">{{ err }}</li>
        </ul>
      </div>

      <!-- Editable form -->
      <form class="flex flex-col gap-8" @submit.prevent="submitForm(false)">
        <!-- Product Details -->
        <div class="rounded-lg p-6 bg-gray-50">
          <h2 class="mt-0 mb-4 text-xl font-medium">{{ t('productDetails') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.name') }} *</label>
              <InputText v-model="product.name" class="mt-1 w-full" :placeholder="t('addProduct.namePlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.type') }} *</label>
              <InputText v-model="product.type" class="mt-1 w-full" :placeholder="t('addProduct.typePlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.category') }} *</label>
              <Dropdown v-model="product.category" :options="categories" option-label="label" option-value="value" class="mt-1 w-full" :placeholder="t('addProduct.categoryPlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.price') }} *</label>
              <InputNumber v-model="product.price" class="mt-1 w-full" mode="decimal" :min-fraction-digits="2" :max-fraction-digits="2" :placeholder="t('addProduct.pricePlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.size') }}</label>
              <InputText v-model="product.size" class="mt-1 w-full" :placeholder="t('addProduct.sizePlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.barcode') }}</label>
              <InputText v-model="product.barcode" class="mt-1 w-full" :placeholder="t('addProduct.barcodePlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('expirationDate') }}</label>
              <InputText v-model="product.expirationDate" class="mt-1 w-full" placeholder="YYYY-MM-DD" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">Image URL</label>
              <InputText v-model="product.imageUrl" class="mt-1 w-full" placeholder="https://..." />
            </div>
          </div>
        </div>

        <!-- Inventory Information -->
        <div class="rounded-lg p-6 bg-gray-50">
          <h2 class="mt-0 mb-4 text-xl font-medium">{{ t('inventoryInfo') }}</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.initialStock') }}</label>
              <InputNumber v-model="product.initialStock" class="mt-1 w-full" :min="0" :placeholder="t('addProduct.initialStockPlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.minStockLevel') }}</label>
              <InputNumber v-model="product.minStockLevel" class="mt-1 w-full" :min="0" :placeholder="t('addProduct.minStockLevelPlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.location') }}</label>
              <InputText v-model="product.location" class="mt-1 w-full" :placeholder="t('addProduct.locationPlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.unit') }}</label>
              <Select v-model="product.unit" :options="units" option-label="label" option-value="value" class="mt-1 w-full" :placeholder="t('addProduct.unitPlaceholder')" />
            </div>
            <div class="flex flex-col">
              <label class="font-medium text-gray-600 text-sm">{{ t('addProduct.supplier') }}</label>
              <Select
                v-model="product.supplier"
                :options="suppliers"
                option-label="label"
                option-value="value"
                class="mt-1 w-full"
                :placeholder="isLoadingSuppliers ? t('common.loading') : t('addProduct.supplierPlaceholder')"
                :disabled="isLoadingSuppliers"
                :loading="isLoadingSuppliers"
              >
                <template #empty>
                  <div v-if="isLoadingSuppliers" class="p-2 text-center text-gray-500">
                    {{ t('common.loading') }}...
                  </div>
                  <div v-else class="p-2 text-center text-gray-500">
                    {{ t('common.noOptions') }}
                  </div>
                </template>
              </Select>
              <div v-if="!isLoadingSuppliers && suppliers.length === 0" class="mt-1">
                <small class="text-blue-600 cursor-pointer" @click="$router.push('/suppliers/addSuppliers')">
                  + {{ t('suppliers.addSupplier') }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="rounded-lg p-6 bg-gray-50">
          <h2 class="mt-0 mb-4 text-xl font-medium">{{ t('addProduct.description') }}</h2>
          <Textarea v-model="product.description" class="w-full" rows="2" :placeholder="t('addProduct.descriptionPlaceholder')" />
        </div>

        <!-- Action buttons -->
        <div class="flex gap-4 mt-2">
          <Button type="button" @click="submitForm(false)">{{ t('addProduct.saveButton') }}</Button>
          <Button type="button" class="p-button-success" @click="saveAndFinish">{{ t('addProduct.saveAndFinish') }}</Button>
          <Button type="button" variant="secondary" @click="$router.back()">{{ t('back') || 'Back' }}</Button>
        </div>
      </form>
    </div>

    <div v-else class="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <p>{{ t('productNotFound') || 'Product not found' }}</p>
      <Button @click="$router.push('/products')">
        {{ t('backToProducts') || 'Back to Products' }}
      </Button>
    </div>
  </div>
</template>