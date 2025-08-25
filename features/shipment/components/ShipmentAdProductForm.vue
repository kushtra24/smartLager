<script lang="ts" setup>

const props = defineProps<{
  selectedProduct: Product | null;
  addedProducts: Product[];
  // onAddProduct: (product: Product) => void;
}>();

const editableVolume = ref<number>(1)
const editablePrice = ref<number | null>(null)
const totalPrice = ref<number>(0)

function updateTotalPrice() {
  if (editablePrice.value !== null && editableVolume.value > 0) {
    totalPrice.value = editablePrice.value * editableVolume.value;
  } else {
    totalPrice.value = 0;
  }
}

watch(props.selectedProduct, (pack) => {
  if (pack && pack.price) {
    // Remove euro sign and parse float
    const priceNum = parseFloat(pack.price.replace(/[^\d.]/g, ''))
    editablePrice.value = isNaN(priceNum) ? null : priceNum
    // Reset volume to 1 when product changes
    editableVolume.value = 1
    // Update total price
    updateTotalPrice()
  } else {
    editablePrice.value = null
    totalPrice.value = 0
  }
})

// Function to increment volume
function incrementVolume() {
  editableVolume.value++;
  updateTotalPrice();
}

// Function to decrement volume
function decrementVolume() {
  if (editableVolume.value > 1) {
    editableVolume.value--;
    updateTotalPrice();
}
}

function addProduct() {
  if (
    !props.electedProduct ||
    editablePrice.value === null ||
    editablePrice.value === undefined ||
    editablePrice.value < 0 ||
    editableVolume.value <= 0
  ) {
    toast.add({ severity: 'error', summary: 'Please enter valid price and volume values.', life: 3000 });
    return;
  }

  props.addedProducts.push({
    name: selectedProduct.value.name,
    description: selectedProduct.value.description,
    price: totalPrice.value,
    volume: editableVolume.value,
    unitPrice: editablePrice.value
  })

  props.selectedProduct = null
  editablePrice.value = null
  editableVolume.value = 1
  totalPrice.value = 0
}

</script>

<template>
  <form class="mt-6" @submit.prevent="addProduct">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="mb-4 md:mb-0">
        <label class="block mb-2 font-medium text-gray-700">{{ $t('addProduct.name') }}</label>
        <input class="w-full border p-2 rounded bg-gray-100" type="text" :value="selectedProduct.name" readonly>
      </div>

      <div class="mb-4 md:mb-0">
        <label class="block mb-2 font-medium text-gray-700">{{ $t('addProduct.type') }}</label>
        <input class="w-full border p-2 rounded bg-gray-100" type="text" :value="selectedProduct.type" readonly>
      </div>

      <div class="mb-4 md:mb-0">
        <label class="block mb-2 font-medium text-gray-700">{{ $t('shipments.addProduct.volume') }}</label>
        <div class="flex items-center">
          <button type="button" class="px-3 py-2 bg-gray-200 rounded-l border-y border-l"
            @click="decrementVolume">-</button>
          <input v-model.number="editableVolume" class="flex-1 border-y p-2 text-center" type="number" step="1" min="1"
            @input="updateTotalPrice">
          <button type="button" class="px-3 py-2 bg-gray-200 rounded-r border-y border-r"
            @click="incrementVolume">+</button>
        </div>
      </div>

      <div class="mb-4 md:mb-0">
        <label class="block mb-2 font-medium text-gray-700">{{ $t('shipments.addProduct.price') }}
          ({{ $t('shipments.addProduct.perUnit') }})</label>
        <div class="flex items-center">
          <span class="px-3 py-2 bg-gray-200 rounded-l border-y border-l">€</span>
          <input v-model.number="editablePrice" class="flex-1 border-y border-r p-2" type="number" step="0.01"
            @input="updateTotalPrice">
        </div>
      </div>

      <div class="mb-4 md:mb-0">
        <label class="block mb-2 font-medium text-gray-700">{{ $t('shipments.addProduct.totalPrice') }}</label>
        <div class="flex items-center">
          <span class="px-3 py-2 bg-gray-200 rounded-l border-y border-l">€</span>
          <input :value="totalPrice.toFixed(2)" class="flex-1 border-y border-r p-2 bg-gray-100 rounded-r" type="text"
            readonly>
        </div>
      </div>

      <div class="mb-4 md:mb-0 md:flex md:items-end">
        <button class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          type="button" @click="addProduct">
          {{ $t('addProduct.addButton') }}
        </button>
      </div>
    </div>
  </form>
</template>