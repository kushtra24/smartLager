<template>
  <div>
    <SkeletonLoading v-if="loading" type="small" />
    <div v-else>
      <form @submit.prevent>
        <h2 class="text-xl font-bold mb-4">
          {{ $t("shipments.selectProduct") }}
        </h2>
        <Select
          v-model="selectedProduct"
          v-focustrap
          editable
          :options="allProducts"
          option-label="name"
          :placeholder="$t('shipments.selectProduct')"
          class="w-full md:w-96"
        >
          <template #option="slotProps">
            <div class="flex items-center">
              <div>
                {{ slotProps.option.name }} | {{ slotProps.option.type }}
              </div>
            </div>
          </template>
        </Select>
      </form>

      <form v-if="selectedProduct" class="mt-6" @submit.prevent="addProduct">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="mb-4 md:mb-0">
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("addProduct.name")
            }}</label>
            <input
              class="w-full border p-2 rounded bg-gray-100"
              type="text"
              :value="selectedProduct.name"
              readonly
            />
          </div>

          <div class="mb-4 md:mb-0">
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("addProduct.type")
            }}</label>
            <input
              class="w-full border p-2 rounded bg-gray-100"
              type="text"
              :value="selectedProduct.type"
              readonly
            />
          </div>

          <div class="mb-4 md:mb-0">
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("shipments.addProduct.quantity")
            }}</label>
            <div class="flex items-center">
              <button
                type="button"
                class="px-3 py-2 bg-gray-200 rounded-l border-y border-l"
                @click="decrementQuantity"
              >
                -
              </button>
              <input
                v-model.number="editableQuantity"
                class="flex-1 border-y p-2 text-center"
                type="number"
                step="1"
                min="1"
                @input="updateTotalPrice"
              />
              <button
                type="button"
                class="px-3 py-2 bg-gray-200 rounded-r border-y border-r"
                @click="incrementQuantity"
              >
                +
              </button>
            </div>
          </div>

          <div class="mb-4 md:mb-0">
            <label class="block mb-2 font-medium text-gray-700"
              >{{ $t("shipments.addProduct.price") }} ({{
                $t("shipments.addProduct.perUnit")
              }})</label
            >
            <div class="flex items-center">
              <span class="px-3 py-2 bg-gray-200 rounded-l border-y border-l"
                >€</span
              >
              <input
                v-model.number="editablePrice"
                class="flex-1 border-y border-r p-2"
                type="number"
                step="0.01"
                @input="updateTotalPrice"
              />
            </div>
          </div>

          <div class="mb-4 md:mb-0">
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("shipments.addProduct.totalPrice")
            }}</label>
            <div class="flex items-center">
              <span class="px-3 py-2 bg-gray-200 rounded-l border-y border-l"
                >€</span
              >
              <input
                :value="totalPrice.toFixed(2)"
                class="flex-1 border-y border-r p-2 bg-gray-100 rounded-r"
                type="text"
                readonly
              />
            </div>
          </div>

          <div class="mb-4 md:mb-0 md:flex md:items-end">
            <button
              class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              type="button"
              @click="addProduct"
            >
              {{ $t("addProduct.addButton") }}
            </button>
          </div>
        </div>
      </form>

      <div v-if="noProductsAvailable" class="my-4">
        <Message severity="error">
          {{ $t("shipments.noProductsAvailable") }}
          <router-link
            :to="localePath('/products/addProduct')"
            class="font-semibold text-blue-600 hover:underline"
          >
            {{ $t("shipments.addNewProduct") }}
          </router-link>
        </Message>
      </div>

      <div v-if="addedProducts.length" class="mt-8">
        <h2 class="text-xl font-bold mb-4">
          {{ $t("shipments.addedProducts.title") }}
        </h2>
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <DataTable :value="addedProducts" table-style="min-width: 50rem">
            <ColumnGroup type="header">
              <Row>
                <Column
                  :header="$t('shipments.addedProducts.product')"
                  sortable
                  :rowspan="3"
                />
                <Column
                  :header="$t('shipments.addedProducts.type')"
                  sortable
                  field="type"
                />
                <Column
                  :header="$t('shipments.addedProducts.description')"
                  sortable
                  field="description"
                />
                <Column
                  :header="$t('shipments.addedProducts.quantity')"
                  sortable
                  field="quanity"
                />
                <Column
                  :header="$t('shipments.addedProducts.unitPrice')"
                  sortable
                  field="unitPrice"
                />
                <Column
                  :header="$t('shipments.addedProducts.total')"
                  sortable
                  field="price"
                />
                <Column
                  :header="$t('shipments.addedProducts.actions')"
                  field="action"
                />
              </Row>
            </ColumnGroup>
            <Column field="name" />
            <Column field="type">
              <template #body="slotProps">
                {{ slotProps.data.type }}
              </template>
            </Column>
            <Column field="description">
              <template #body="slotProps">
                {{ slotProps.data.description }}
              </template>
            </Column>
            <Column field="quanity">
              <template #body="slotProps">
                {{ slotProps.data.quantity }}
              </template>
            </Column>
            <Column field="unitPrice">
              <template #body="slotProps">
                € {{ slotProps.data.unitPrice.toFixed(2) }}
              </template>
            </Column>
            <Column field="price">
              <template #body="slotProps">
                € {{ slotProps.data.price.toFixed(2) }}
              </template>
            </Column>
            <Column field="action">
              <template #body="slotProps">
                <button
                  class="text-red-600 hover:text-red-800"
                  @click="removeProduct(slotProps.data.id)"
                >
                  <font-awesome icon="trash" />
                </button>
              </template>
            </Column>
            <ColumnGroup type="footer">
              <Row>
                <Column
                  footer="Totals:"
                  :colspan="3"
                  footer-style="text-align:right"
                />
                <Column :footer="calculateGrandTotal().toFixed(2)" />
              </Row>
            </ColumnGroup>
          </DataTable>
        </div>
      </div>
      <!-- Invoice Details Section -->
      <div class="mt-6 border rounded-lg p-5 bg-white shadow-sm">
        <h2 class="text-xl font-bold mb-4">{{ $t("invoice.details") }}</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Invoice Number -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("invoice.invoiceNumber")
            }}</label>
            <InputText v-model="invoice.invoiceNumber" class="w-full" />
          </div>

          <!-- Invoice Date (Today) -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("invoice.date")
            }}</label>
            <DatePicker
              v-model="invoice.date"
              :show-icon="true"
              :disabled="true"
              date-format="dd/mm/yy"
              class="w-full"
            />
          </div>

          <!-- Due Date (Default: Tomorrow) -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("invoice.dueDate")
            }}</label>
            <DatePicker
              v-model="invoice.dueDate"
              :show-icon="true"
              date-format="dd/mm/yy"
              class="w-full"
            />
          </div>

          <!-- Subtotal (Calculated) -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("invoice.subtotal")
            }}</label>
            <div class="flex items-center">
              <span class="px-3 py-2 bg-gray-200 rounded-l border-y border-l"
                >€</span
              >
              <InputText
                :value="calculateGrandTotal().toFixed(2)"
                class="w-full bg-gray-100"
                readonly
              />
            </div>
          </div>

          <!-- Tax Rate (Default: Swiss VAT) -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("invoice.taxRate")
            }}</label>
            <div class="flex items-center">
              <InputNumber
                v-model="invoice.taxRate"
                class="w-full"
                suffix="%"
                :min-fraction-digits="2"
                :max-fraction-digits="2"
              />
            </div>
          </div>

          <!-- Total (Calculated with Tax) -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("invoice.total")
            }}</label>
            <div class="flex items-center">
              <span class="px-3 py-2 bg-gray-200 rounded-l border-y border-l"
                >€</span
              >
              <InputText
                :value="calculateTotalWithTax().toFixed(2)"
                class="w-full bg-gray-100"
                readonly
              />
            </div>
          </div>

          <!-- Invoice Status -->
          <div>
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("invoice.status")
            }}</label>
            <Select
              v-model="invoice.status"
              :options="invoiceStatusOptions"
              option-label="label"
              option-value="value"
              class="w-full"
            />
          </div>

          <!-- Notes -->
          <div class="md:col-span-2">
            <label class="block mb-2 font-medium text-gray-700">{{
              $t("invoice.notes")
            }}</label>
            <Textarea
              v-model="invoice.notes"
              rows="3"
              class="w-full"
              :placeholder="$t('invoice.notesPlaceholder')"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col mt-6">
        <h2 class="text-xl font-bold mb-4">
          {{ $t("shipments.addClient") }}
        </h2>
        <Skeleton v-if="loadingClient" width="10rem" class="mb-2" />
        <AutoComplete
          v-model="selectedClient"
          :suggestions="allClients"
          option-label="companyName"
          :placeholder="$t('shipments.addClient')"
          required
          class="w-full md:w-96"
          @complete="searchClients"
        />

        <!-- Client Invoice Preview -->
        <div
          v-if="selectedClient"
          class="mt-4 border rounded-lg p-4 bg-gray-50"
        >
          <h3 class="text-lg font-semibold border-b pb-2 mb-3">
            {{ $t("invoice.clientDetails") }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p class="font-medium">{{ selectedClient?.companyName }}</p>
              <p>{{ selectedClient.billing_address?.street }}</p>
              <p>
                {{ selectedClient.billing_address?.city }},
                {{ selectedClient.billing_address?.postalCode }}
              </p>
              <p>
                {{ selectedClient.billing_address?.state }}
                {{ selectedClient.billing_address?.country }}
              </p>
            </div>
            <div>
              <p v-if="selectedClient?.firstName">
                <span class="font-medium"
                  >{{ $t("client.selectedClient.name") }}:</span
                >
                {{ selectedClient?.firstName }} {{ selectedClient?.lastName }}
              </p>
              <p>
                <span class="font-medium"
                  >{{ $t("client.selectedClient.email") }}:</span
                >
                {{ selectedClient.email || "-" }}
              </p>
              <p>
                <span class="font-medium"
                  >{{ $t("client.selectedClient.phone") }}:</span
                >
                {{ selectedClient.phone || "-" }}
              </p>
              <!-- <p>
                <span class="font-medium"
                  >{{ $t("client.selectedClient.contactPerson") }}:</span
                >
                {{ selectedClient.contactPerson || "-" }}
              </p> -->
            </div>
          </div>
        </div>
      </div>

      <!-- submit buttons -->
      <div class="flex gap-6 mt-6">
        <button
          class="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          @click="saveAndMoveToInvoice"
        >
          {{ $t("invoice.createAndSave") }}
        </button>

        <button
          class="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="saveShipment"
        >
          {{ $t("common.save") }}
        </button>
      </div>
    </div>
    <Toast />
  </div>
</template>

<script lang="ts" setup>
import axiosClient from "@/axiosClient";
import SkeletonLoading from "../../components/base/SkeletonLoading.vue";
import { useLocalePath } from "#imports";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const selectedProduct = ref<ProductPack | null>(null);
const editablePrice = ref<number | null>(null);
const editableQuantity = ref<number>(1);
const totalPrice = ref<number>(0);
const localePath = useLocalePath();
const addedProducts = ref<
  Array<{
    name: string;
    type: string;
    description: string;
    price: number;
    quantity: number;
    unitPrice: number;
  }>
>([]);
const allProducts = ref<Product[]>([]);
const loading = ref(true);
const selectedClient = ref(null);
const allClients = ref([]);
const loadingClient = ref(false);

// Invoice data
const invoice = ref({
  invoiceNumber: generateInvoiceNumber(),
  date: new Date(),
  dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
  taxRate: 8.1, // Default Swiss VAT
  status: "pending",
  notes: "",
});

// Invoice status options
const invoiceStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "In Shipment", value: "inShipment" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
];

// Generate invoice number (YYYY-MM-XXXXX format)
function generateInvoiceNumber() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  return `${year}-${month}-${random}`;
}

// Calculate total with tax
function calculateTotalWithTax() {
  const subtotal = calculateGrandTotal();
  const taxAmount = subtotal * (invoice.value.taxRate / 100);
  return subtotal + taxAmount;
}

// Fetch products from API
async function fetchProducts() {
  loading.value = true;
  try {
    const response = await axiosClient.get("api/shipementSelectProducts");
    allProducts.value = response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    loading.value = false;
  }
}

// Fetch clients
async function searchClients(event: { query: string }) {
  loadingClient.value = true;
  try {
    const response = await axiosClient.get(
      `api/getClientByName?query=${event.query}`
    );
    allClients.value = response.data;
  } catch (error) {
    console.error("Error fetching clients:", error);
  } finally {
    loadingClient.value = false;
  }
}

const totalWithTax = computed(() => {
  return calculateTotalWithTax();
});

const totalAmount = computed(() => {
  return calculateGrandTotal();
});

const payload = computed(() => ({
  client: selectedClient.value,
  products: addedProducts.value,
  invoice: {
    invoice_number: invoice.value.invoiceNumber,
    date: invoice.value.date,
    due_date: invoice.value.dueDate,
    subtotal: totalAmount.value,
    tax_rate: invoice.value.taxRate,
    tax_amount: totalAmount.value * (invoice.value.taxRate / 100),
    total: totalWithTax.value,
    status: invoice.value.status,
    notes: invoice.value.notes,
  },
}));

async function saveShipment() {
  try {
    await axiosClient.post("api/shipments", payload.value);

    // Show success message
    toast.add({
      severity: "success",
      summary: "Info",
      detail: $t("shipments.savedSuccessfully"),
      life: 3000,
    });

    // Optionally clear form or redirect
    // addedProducts.value = [];
    // selectedClient.value = null;

    return true; // Return true to indicate success
  } catch (error) {
    console.error("Error saving shipment:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: $t("shipments.saveFailed"),
      life: 3000,
    });

    return false; // Return false to indicate failure
  }
}

async function saveAndMoveToInvoice() {
  const success = await saveShipment();

  if (success) {
    window.location.href = localePath("/invoices");
  }
}

// Load products when component is mounted
onMounted(() => {
  fetchProducts();
});

// Update total price based on quantity and unit price
function updateTotalPrice() {
  if (editablePrice.value !== null && editableQuantity.value > 0) {
    totalPrice.value = editablePrice.value * editableQuantity.value;
  } else {
    totalPrice.value = 0;
  }
}

watch(selectedProduct, (pack) => {
  if (pack && pack.price) {
    // Remove euro sign and parse float
    const priceNum = parseFloat(pack.price.replace(/[^\d.]/g, ""));
    editablePrice.value = isNaN(priceNum) ? null : priceNum;
    // Reset quantity to 1 when product changes
    editableQuantity.value = 1;
    // Update total price
    updateTotalPrice();
  } else {
    editablePrice.value = null;
    totalPrice.value = 0;
  }
});

const noProductsAvailable = computed(() => {
  return allProducts.value.length === 0;
});

function addProduct() {
  if (
    !selectedProduct.value ||
    editablePrice.value === null ||
    editablePrice.value === undefined ||
    editablePrice.value < 0 ||
    editableQuantity.value <= 0
  ) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: $t("shipments.enterValidPriceAndQuantity"),
      life: 3000,
    });

    return;
  }

  addedProducts.value.push({
    name: selectedProduct.value.name,
    type: selectedProduct.value.type,
    description: selectedProduct.value.description,
    price: totalPrice.value,
    quantity: editableQuantity.value,
    unitPrice: editablePrice.value,
  });

  selectedProduct.value = null;
  editablePrice.value = null;
  editableQuantity.value = 1;
  totalPrice.value = 0;
}

function removeProduct(idx: number) {
  addedProducts.value.splice(idx, 1);
}

// Function to increment quantity
function incrementQuantity() {
  editableQuantity.value++;
  updateTotalPrice();
}

// Function to decrement quantity
function decrementQuantity() {
  if (editableQuantity.value > 1) {
    editableQuantity.value--;
    updateTotalPrice();
  }
}

// Calculate grand total
function calculateGrandTotal() {
  return addedProducts.value.reduce(
    (total, product) => total + product.price,
    0
  );
}
</script>
