<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { v4 as uuidv4 } from "uuid";
import axiosClient from "~/axiosClient";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
// Initialize the toast service
const toast = useToast();
const router = useRouter();

const product = ref({
  id: uuidv4(),
  name: "",
  type: "",
  category: "",
  price: 0.0,
  size: "",
  barcode: "",
  initialStock: 0,
  unit: "",
  supplier: "",
  description: "",
  minStockLevel: 0,
  location: "",
  // expirationDate: '',
  // imageUrl: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const errors = ref<string[]>([]);
const isLoadingSuppliers = ref(false);

const categories = ref([
  { label: $t("category.tools"), value: "tools" },
  { label: $t("category.consumables"), value: "consumables" },
  { label: $t("category.other"), value: "other" },
]);
const units = ref([
  { label: $t("unit.piece"), value: "piece" },
  { label: $t("unit.kg"), value: "kg" },
  { label: $t("unit.liter"), value: "liter" },
]);

// Replace static suppliers with dynamic fetched data
const suppliers = ref<{ label: string; value: string }[]>([]);

// Function to fetch suppliers from the API
const fetchSuppliers = async () => {
  isLoadingSuppliers.value = true;
  try {
    const response = await axiosClient.get("/api/suppliers");

    // Map API response to format needed for dropdown
    suppliers.value = response.data.data.map((supplier: any) => ({
      label: supplier.name || supplier.companyName, // Adjust according to your API response structure
      value: supplier.id.toString(),
    }));

    // If product has a supplier set but it's not in the list, reset it
    if (
      product.value.supplier &&
      !suppliers.value.some((s) => s.value === product.value.supplier)
    ) {
      product.value.supplier = "";
    }
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    errors.value.push("Failed to load suppliers. Please try again.");
  } finally {
    isLoadingSuppliers.value = false;
  }
};

// Fetch suppliers when component is mounted
onMounted(() => {
  fetchSuppliers();
});

function validateForm() {
  errors.value = [];
  if (!product.value.name.trim())
    errors.value.push("Product Name is required.");
  if (!product.value.type.trim()) errors.value.push("Type is required.");
  if (!product.value.category) errors.value.push("Category is required.");
  if (
    product.value.price === null ||
    product.value.price === undefined ||
    product.value.price === 0
  )
    errors.value.push("Price is required and must be greater than 0.");
  return errors.value.length === 0;
}
function submitForm() {
  if (!validateForm()) return;
  product.value.updatedAt = new Date().toISOString();

  axiosClient
    .post("/api/products", product.value)
    .then((response) => {
      console.log("Success:", response.data);
      // Show success toast
      toast.add({
        severity: "success",
        summary: $t("common.success"),
        detail: $t("addProduct.successMessage"),
        life: 3000,
      });
    })
    .catch((error) => {
      console.error("Error:", error);

      // Handle specific error message for product limit
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;

        if (errorMessage === $t("addProduct.productLimitReached")) {
          // Show product limit error toast
          toast.add({
            severity: "error",
            summary: $t("common.error"),
            detail: errorMessage,
            life: 5000,
            closable: true,
            // Additional styling to make it more noticeable
            styleClass: "limit-error-toast",
          });
        } else {
          // Show generic error toast for other errors
          toast.add({
            severity: "error",
            summary: $t("common.error"),
            detail: errorMessage || $t("common.unknownError"),
            life: 3000,
          });
        }

        // Add server error to the errors array as well
        if (errorMessage) {
          errors.value.push(errorMessage);
        }
      } else {
        // Generic error handling
        toast.add({
          severity: "error",
          summary: $t("common.error"),
          detail: $t("common.connectionError"),
          life: 3000,
        });
      }
    });
}

function saveAndFinish() {
  submitForm();
  // redirect to products
  router.push("/products");
}
</script>

<template>
  <div class="p-4 max-w-md mx-auto">
    <!-- Add Toast component -->
    <Toast position="top-right" />

    <h1 class="text-xl font-bold mb-4">{{ $t("addProduct.title") }}</h1>
    <div v-if="errors.length" class="mb-4">
      <ul
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded"
      >
        <li v-for="(err, idx) in errors" :key="idx">{{ err }}</li>
      </ul>
    </div>
    <form class="flex flex-col gap-4" @submit.prevent="submitForm">
      <div>
        <label class="block text-sm font-medium mb-1"
          >{{ $t("addProduct.name") }}
          <span class="text-red-500">*</span></label
        >
        <InputText
          v-model="product.name"
          class="w-full"
          :placeholder="$t('addProduct.namePlaceholder')"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1"
          >{{ $t("addProduct.type") }}
          <span class="text-red-500">*</span></label
        >
        <InputText
          v-model="product.type"
          class="w-full"
          :placeholder="$t('addProduct.typePlaceholder')"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1"
          >{{ $t("addProduct.category") }}
          <span class="text-red-500">*</span></label
        >
        <Select
          v-model="product.category"
          :options="categories"
          option-label="label"
          option-value="value"
          :placeholder="$t('addProduct.categoryPlaceholder')"
          class="w-full"
          required
        />
      </div>
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1"
            >{{ $t("addProduct.price") }}
            <span class="text-red-500">*</span></label
          >
          <InputNumber
            v-model="product.price"
            class="w-full"
            mode="decimal"
            :min-fraction-digits="2"
            :max-fraction-digits="2"
            required
            :placeholder="$t('addProduct.pricePlaceholder')"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">{{
            $t("addProduct.size")
          }}</label>
          <InputText
            v-model="product.size"
            class="w-full"
            :placeholder="$t('addProduct.sizePlaceholder')"
            required
          />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{
          $t("addProduct.barcode")
        }}</label>
        <InputText
          v-model="product.barcode"
          class="w-full"
          :placeholder="$t('addProduct.barcodePlaceholder')"
          required
        />
      </div>
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">{{
            $t("addProduct.initialStock")
          }}</label>
          <InputNumber
            v-model="product.initialStock"
            class="w-full"
            :min="0"
            required
            :placeholder="$t('addProduct.initialStockPlaceholder')"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">{{
            $t("addProduct.unit")
          }}</label>
          <Select
            v-model="product.unit"
            :options="units"
            option-label="label"
            option-value="value"
            :placeholder="$t('addProduct.unitPlaceholder')"
            class="w-full"
            required
          />
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{
          $t("addProduct.supplier")
        }}</label>
        <Select
          v-model="product.supplier"
          :options="suppliers"
          option-label="label"
          option-value="value"
          :placeholder="
            isLoadingSuppliers
              ? $t('common.loading')
              : $t('addProduct.supplierPlaceholder')
          "
          class="w-full"
          :disabled="isLoadingSuppliers"
          :loading="isLoadingSuppliers"
          required
        >
          <template #empty>
            <div
              v-if="isLoadingSuppliers"
              class="p-2 text-center text-gray-500"
            >
              {{ $t("common.loading") }}...
            </div>
            <div v-else class="p-2 text-center text-gray-500">
              {{ $t("common.noOptions") }}
            </div>
          </template>
        </Select>
        <div v-if="!isLoadingSuppliers && suppliers.length === 0" class="mt-1">
          <small
            class="text-blue-600 cursor-pointer"
            @click="$router.push('/suppliers/addSuppliers')"
          >
            + {{ $t("suppliers.addSupplier") }}
          </small>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">{{
          $t("addProduct.description")
        }}</label>
        <Textarea
          v-model="product.description"
          class="w-full"
          rows="2"
          :placeholder="$t('addProduct.descriptionPlaceholder')"
        />
      </div>
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">{{
            $t("addProduct.minStockLevel")
          }}</label>
          <InputNumber
            v-model="product.minStockLevel"
            class="w-full"
            :min="0"
            required
            :placeholder="$t('addProduct.minStockLevelPlaceholder')"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium mb-1">{{
            $t("addProduct.location")
          }}</label>
          <InputText
            v-model="product.location"
            class="w-full"
            :placeholder="$t('addProduct.locationPlaceholder')"
            required
          />
        </div>
      </div>
      <!-- <div>
				<label class="block text-sm font-medium mb-1">Expiration Date <span class="text-xs text-gray-400">(if perishable)</span></label>
				<Calendar v-model="product.expirationDate" class="w-full" date-format="yy-mm-dd" show-icon />
			</div> -->
      <!-- <div>
				<label class="block text-sm font-medium mb-1">Product Image</label>
			<input class="block w-full text-sm" type="file" accept="image/*" @change="handleImageUpload">
			<img v-if="product.imageUrl" :src="product.imageUrl" alt="Preview" class="mt-2 w-24 h-24 object-cover rounded border">
			</div> -->
      <div class="flex justify-between">
        <button
          type="submit"
          class="mt-4 py-2 px-4 bg-green-600 text-white rounded shadow hover:bg-green-700"
          @click="saveAndFinish"
        >
          {{ $t("addProduct.saveAndFinish") }}
        </button>
        <button
          type="submit"
          class="mt-4 py-2 px-4 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
        >
          {{ $t("addProduct.saveButton") }}
        </button>
      </div>
    </form>
  </div>
</template>

<style>
/* Optional: Custom styling for the limit error toast */
.limit-error-toast {
  background-color: #fef2f2;
  border-left: 5px solid #dc2626;
  font-weight: 500;
}
</style>
