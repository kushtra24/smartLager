<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import axiosClient from "@/axiosClient";
import SkeletonLoading from "@/features/components/base/SkeletonLoading.vue";
import { SwissQRBill } from "swissqrbill/svg";

const route = useRoute();
const { t, locale } = useI18n();
const invoiceId = route.params.id;
const invoice = ref(null);
const loading = ref(true);
const error = ref(null);
const qrBillError = ref(null); // New ref for QR bill specific errors
const svgContainer = ref<HTMLDivElement | null>(null);

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true
});

const fetchInvoice = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axiosClient.get(`/api/invoices/${invoiceId}`);
    // Convert string values to numbers for calculations
    const data = response.data;
    if (data) {
      // Ensure numeric values for financial data
      data.subtotal = Number(data.subtotal);
      data.tax_rate = Number(data.tax_rate);
      data.tax_amount = Number(data.tax);
      data.total = Number(data.total);

      // Ensure products have numeric values
      if (data.products && Array.isArray(data.products)) {
        data.products = data.products.map((product) => ({
          ...product,
          volume: Number(product.pivot.quantity),
          unitPrice: Number(product.pivot.unit_price),
          price: Number(product.pivot.total),
          description: product.pivot.description,
        }));
      }
    }
    invoice.value = data;
    // Generate QR bill after data is loaded
    showInvoiceQR();
  } catch (err) {
    console.error("Error fetching invoice:", err);
    error.value = err.message || t("common.unknownError");
  } finally {
    loading.value = false;
  }
};

const showInvoiceQR = () => {
  try {
    // Reset QR bill error
    qrBillError.value = null;
    
    // First make sure container exists and is empty
    if (!svgContainer.value) {
      console.error("SVG container not found");
      return;
    }

    // Clear previous content
    svgContainer.value.innerHTML = "";

    const client = invoice.value.client;
    const company = invoice.value.company;

    if (!client) {
      console.error("No client data available");
      return;
    }

    // Validate required QR bill data before proceeding
    if (!company.iban) {
      qrBillError.value = $t("error.missingCreditorAccount");
      return;
    }

    // Create a simpler QR bill data structure
    const qrData = {
      currency: "CHF",
      amount: invoice.value.total,
      creditor: {
        name: company.name || "N/A",
        address: company.address.street || "N/A",
        zip: company.address.postalCode || "N/A",
        city: company.address.city || "N/A",
        country: company.address.country || "CH",
        account: company.iban, // Make sure this exists
      },
      debtor: {
        name: client.companyName || client.name || "N/A",
        address: client.billing_address.street || "N/A",
        zip: client.billing_address.postalCode || "N/A",
        city: client.billing_address.city || "N/A",
        country: client.billing_address.country || "CH",
      },
      additionalInformation: `Invoice #${invoice.value.invoice_number}`,
    };

    // Create the QR bill instance
    const bill = new SwissQRBill(qrData);

    // For debugging
    console.log("Bill object created:", bill);
    console.log("Bill element exists:", !!bill.element);

    // Force a small delay to ensure Vue has finished updating the DOM
    setTimeout(() => {
      if (bill.element && svgContainer.value) {
        console.log("Attempting to append QR bill to container");
        // Create a wrapper div to hold the SVG
        const wrapper = document.createElement("div");
        wrapper.style.width = "100%";
        wrapper.style.height = "100%";
        wrapper.style.display = "flex";
        wrapper.style.justifyContent = "center";

        // Append the bill element to the wrapper
        wrapper.appendChild(bill.element);

        // Clear and append to the container
        svgContainer.value.innerHTML = "";
        svgContainer.value.appendChild(wrapper);
      } else {
        console.error("QR Bill element was not created or container not found");
      }
    }, 100);
  } catch (err) {
    console.error("Error generating QR bill:", err, err.stack);
    // Set QR bill specific error message
    if (err.message && err.message.includes("Creditor account cannot be undefined")) {
      qrBillError.value = "Error generating QR bill: ValidationError: Creditor account cannot be undefined.";
    } else {
      qrBillError.value = `Error generating QR bill: ${err.message || "Unknown error"}`;
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  try {
    // Use the current locale from i18n with fallback to 'de-DE'
    return new Intl.DateTimeFormat(locale.value || "de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (err) {
    console.error("Error formatting date:", err);
    // Fallback to simple date format
    return date.toLocaleDateString();
  }
};

const printInvoice = () => {
  window.print();
};

// Helper function to safely format numeric values
const formatCurrency = (value) => {
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

onMounted(() => {
  fetchInvoice();
  // We'll let fetchInvoice call showInvoiceQR after data is loaded
});
</script>

<template>
  <div class="p-4 max-w-5xl mx-auto print:max-w-none">
    <!-- Loading state -->
    <SkeletonLoading v-if="loading" />

    <!-- Error state -->
    <Message v-else-if="error" severity="error" :closable="false" class="mb-4">
      {{ error }}
    </Message>

    <!-- Invoice content -->
    <div
      v-else-if="invoice"
      class="bg-white rounded-lg shadow-md p-6 print:shadow-none invoice-page"
    >
      <!-- Action buttons (hidden when printing) -->
      <div class="flex justify-end gap-3 mb-6 print:hidden">
        <Button
          type="button"
          severity="secondary"
          icon="pi pi-arrow-left"
          :label="t('common.back')"
          @click="$router.back()"
        />
        <Button
          type="button"
          severity="info"
          icon="pi pi-print"
          :label="t('invoice.print')"
          @click="printInvoice"
        />
      </div>

      <!-- Invoice header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold mb-1">{{ t("invoice.title") }}</h1>
            <p class="text-gray-600">#{{ invoice.invoice_number }}</p>
          </div>
          <div class="print:hidden">
          <Tag
            :severity="
              invoice.status === 'paid'
                ? 'success'
                : invoice.status === 'overdue'
                ? 'danger'
                : 'info'
            "
            class="self-start sm:self-center mt-2 sm:mt-0 print:hidden"
          >
            {{ t(`invoice.statuses.${invoice.status}`) }}
          </Tag>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6">
          <!-- Company details -->
          <div>
            <h2 class="text-lg font-semibold mb-2">{{ t("invoice.from") }}</h2>
            <p class="font-medium">{{ invoice.company?.name }}</p>
            <p>{{ invoice.company?.address?.street }}</p>
            <p>{{ invoice.company?.address?.postalcode }}</p>
            <p>{{ invoice.company?.address?.city }}</p>
            <p>{{ invoice.company?.address?.state }} {{ invoice.company?.address?.country }}</p>
            <p class="mt-2 text-red-700">
              {{ t("company.vatLabel") }}: {{ t("company.vatNumber") }}
            </p>
          </div>

          <!-- Client details -->
          <div>
            <h2 class="text-lg font-semibold mb-2">{{ t("invoice.to") }}</h2>
            <p class="font-medium">{{ invoice.client?.companyName }}</p>
            <p>{{ invoice.client?.billing_address?.street }}</p>
            <p>{{ invoice.client?.billing_address?.postalCode }}</p>
            <p>{{ invoice.client?.billing_address?.city }}</p>
            <p>{{ invoice.client?.billing_address?.state }} {{ invoice.client?.billing_address?.country }}</p>
            <p v-if="invoice.client?.vatNumber" class="mt-2">
              {{ t("client.selectedClient.vatNumber") }}:
              {{ invoice.client.vatNumber }}
            </p>
          </div>
        </div>
      </div>

      <!-- Invoice details -->
      <div class="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 mb-8">
        <div class="p-3 bg-gray-50 rounded">
          <p class="text-sm text-gray-500">{{ t("invoice.invoiceNumber") }}</p>
          <p class="font-medium">#{{ invoice.invoice_number }}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded">
          <p class="text-sm text-gray-500">{{ t("invoice.date") }}</p>
          <p class="font-medium">{{ formatDate(invoice.date) }}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded">
          <p class="text-sm text-gray-500">{{ t("invoice.dueDate") }}</p>
          <p class="font-medium">{{ formatDate(invoice.due_date) }}</p>
        </div>
      </div>

      <!-- Products table -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold mb-4">{{ t("invoice.items") }}</h2>
        <DataTable :value="invoice.products" class="p-datatable-sm">
          <Column :header="t('shipments.addedProducts.product')" field="name" />
          <Column
            :header="t('shipments.addedProducts.description')"
            field="description"
          />
          <Column
            :header="t('shipments.addedProducts.quantity')"
            field="volume"
            class="text-right"
          >
            <template #body="slotProps">
              {{ slotProps.data.volume }}
            </template>
          </Column>
          <Column
            :header="t('shipments.addedProducts.unitPrice')"
            field="unitPrice"
            class="text-right"
          >
            <template #body="slotProps">
              CHF {{ slotProps.data.unitPrice.toFixed(2) }}
            </template>
          </Column>
          <Column
            :header="t('shipments.addedProducts.total')"
            field="price"
            class="text-right"
          >
            <template #body="slotProps">
              CHF {{ slotProps.data.price.toFixed(2) }}
            </template>
          </Column>
        </DataTable>
      </div>

      <!-- Totals section -->
      <div class="flex justify-end">
        <div class="w-full md:w-64">
          <div class="flex justify-between py-2 border-b">
            <span>{{ t("invoice.subtotal") }}</span>
            <span>CHF {{ formatCurrency(invoice.subtotal) }}</span>
          </div>
          <div class="flex justify-between py-2 border-b">
            <span
              >{{ t("invoice.taxRate") }} 8,1</span
            >
            <span>CHF {{ formatCurrency(invoice.tax_amount) }}</span>
          </div>
          <div class="flex justify-between py-2 font-bold text-lg">
            <span>{{ t("invoice.total") }}</span>
            <span>CHF {{ formatCurrency(invoice.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes section -->
      <div v-if="invoice.notes" class="mt-8 p-4 bg-gray-50 rounded">
        <h2 class="text-lg font-semibold mb-2">{{ t("invoice.notes") }}</h2>
        <p>{{ invoice.notes }}</p>
      </div>
    </div>

    <!-- No invoice found -->
    <Message v-else severity="info" :closable="false" class="mb-4">
      {{ t("invoice.notFound") }}
    </Message>
    
    <!-- QR Bill Error Message - Only show when there's a QR bill error -->
    <Message v-if="qrBillError" severity="error" :closable="true" class="mb-4 print:hidden">
      {{ qrBillError }}
    </Message>
    
    <!-- QR Bill Page - Will always appear on a new page when printing -->
    <div 
      v-show="!loading && invoice" 
      id="qr-bill-container" 
      class="bg-white rounded-lg shadow-md p-6 print:shadow-none "
    >
      <h2 class="text-lg font-semibold mb-4 page-title">
        {{ t("invoice.paymentDetails") }}
      </h2>
      <div ref="svgContainer" class="qr-wrapper min-h-[300px]"></div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: A4;
    margin: 1cm;
  }
  body {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  /* Ensure grid layouts display properly in print */
  .grid {
    display: grid !important;
  }
  
  .print\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
  
  .print\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }
  
  /* Force QR code to start on a new page */
  .qr-bill-page {
    page-break-before: always;
    margin-top: 0;
    padding-top: 1cm;
  }
  
  /* Full-height invoice page */
  .invoice-page {
    min-height: calc(100vh - 2cm);
  }
  
  /* Reset styles for better print layout */
  .page-title {
    margin-top: 0;
  }
}

.qr-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}

.qr-wrapper :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* Apply spacing between pages only in screen view */
@media screen {
  .qr-bill-page {
    margin-top: 2rem;
  }
}
</style>
