<script lang="ts" setup>
import { ref, reactive } from 'vue';
import axiosClient from '@/axiosClient';
import AddressForm from '@/features/addresses/components/AddressForm.vue';
import { useToast } from "primevue/usetoast";


// Type definitions
interface Address {
  id?: number;
  street: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
  isPrimary: boolean;
}

interface Supplier {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address_id?: number;
  notes: string;
}

// Form validation state
interface ValidationErrors {
  supplier: Record<string, string>;
  address: Record<string, string>;
}

// Form state
const supplierForm = reactive<Supplier>({
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  notes: ''
});

const addressData = reactive<Address>({
  street: '',
  city: '',
  postalCode: '',
  state: '',
  country: '',
  isPrimary: true
});

// Form UI state
const isSubmitting = ref(false);
const formErrors = reactive<ValidationErrors>({
  supplier: {},
  address: {}
});

const isAddressExpanded = ref(true);
const toast = useToast();

// Country options
const countryOptions = [
  { label: 'Kosovo', value: 'XK' },
  { label: 'Schweiz', value: 'CH' },
  { label: 'Deutschland', value: 'DE' },
  { label: 'Österreich', value: 'AT' },
  // Add more countries as needed
];

// Methods for address management
const toggleAddressAccordion = () => {
  isAddressExpanded.value = !isAddressExpanded.value;
};

const updateAddress = (updatedAddress: Address) => {
  Object.assign(addressData, updatedAddress);
};

// Form validation
const validateForm = (): boolean => {
  // Reset errors
  formErrors.supplier = {};
  formErrors.address = {};

  let isValid = true;

  // Supplier validation
  if (!supplierForm.name) {
    formErrors.supplier.name = $t('supplier.validation.nameRequired');
    isValid = false;
  }

  if (!supplierForm.email) {
    formErrors.supplier.email = $t('supplier.validation.emailRequired');
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierForm.email)) {
    formErrors.supplier.email = $t('supplier.validation.emailInvalid');
    isValid = false;
  }

  if (!supplierForm.phone) {
    formErrors.supplier.phone = $t('supplier.validation.phoneRequired');
    isValid = false;
  }

  // Address validation
  if (!addressData.street) {
    formErrors.address.street = $t('supplier.validation.streetRequired');
    isValid = false;
  }

  if (!addressData.city) {
    formErrors.address.city = $t('supplier.validation.cityRequired');
    isValid = false;
  }

  if (!addressData.postalCode) {
    formErrors.address.postalCode = $t('supplier.validation.postalCodeRequired');
    isValid = false;
  }

  if (!addressData.state) {
    formErrors.address.state = $t('supplier.validation.stateRequired');
    isValid = false;
  }

  if (!addressData.country) {
    formErrors.address.country = $t('supplier.validation.countryRequired');
    isValid = false;
  }

  return isValid;
};

const showToast = (message: string, severity: string) => {
  toast.add({
    severity,
    summary: $t('common.toast.infoTitle'),
    detail: message,
    life: 3000
  });
  
};

// Form submission
const submitForm = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;

  try {
    // First, create the address

    // Then create the supplier with the address ID
    await axiosClient.post('api/suppliers', {
      ...supplierForm
    });

    // Show success message
    showToast($t('supplier.messages.addSuccess'), 'success');
    resetForm();
  } catch (error: unknown) {
    showToast($t('supplier.messages.addError'), 'error');
    console.error('Error submitting form:', error);

    // Handle validation errors from backend
    if (error.response && error.response.data && error.response.data.errors) {
      const backendErrors = error.response.data.errors;

      // Map backend errors to our form error structure
      Object.keys(backendErrors).forEach(key => {
        if (key.startsWith('address.')) {
          const field = key.replace('address.', '');
          formErrors.address[field] = backendErrors[key][0];
        } else {
          formErrors.supplier[key] = backendErrors[key][0];
        }
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form
const resetForm = () => {
  supplierForm.name = '';
  supplierForm.contact_person = '';
  supplierForm.email = '';
  supplierForm.phone = '';
  supplierForm.notes = '';
  
  addressData.street = '';
  addressData.city = '';
  addressData.postalCode = '';
  addressData.state = '';
  addressData.country = '';
  
  formErrors.supplier = {};
  formErrors.address = {};
  isAddressExpanded.value = true;
};
</script>

<template>
  <div class="supplier-form-container max-w-4xl mx-auto p-4">
    <!-- Success message -->
    <Toast />

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <div class="bg-gray-50 p-4 border-b">
        <h2 class="text-xl font-semibold text-gray-800">{{ $t('supplier.form.title') }}</h2>
      </div>

      <form class="p-6" @submit.prevent="submitForm">
        <!-- Supplier Information -->
        <div class="p-card p-4 mb-6">
          <h3 class="text-lg font-semibold mb-4 border-b pb-2">{{ $t('supplier.form.supplierInformation') }}</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="field">
              <label for="name" class="block text-gray-700 mb-1">{{ $t('supplier.form.name') }}*</label>
              <InputText id="name" v-model="supplierForm.name" type="text" class="w-full"
                :class="{ 'p-invalid': formErrors.supplier.name }" />
              <small v-if="formErrors.supplier.name" class="p-error">{{ formErrors.supplier.name }}</small>
            </div>

            <div class="field">
              <label for="contact_person" class="block text-gray-700 mb-1">{{ $t('supplier.form.contactPerson') }}</label>
              <InputText id="contact_person" v-model="supplierForm.contact_person" type="text" class="w-full" />
            </div>

            <div class="field">
              <label for="email" class="block text-gray-700 mb-1">{{ $t('supplier.form.email') }}*</label>
              <InputText id="email" v-model="supplierForm.email" type="email" class="w-full"
                :class="{ 'p-invalid': formErrors.supplier.email }" />
              <small v-if="formErrors.supplier.email" class="p-error">{{ formErrors.supplier.email }}</small>
            </div>

            <div class="field">
              <label for="phone" class="block text-gray-700 mb-1">{{ $t('supplier.form.phone') }}*</label>
              <InputText id="phone" v-model="supplierForm.phone" type="text" class="w-full"
                :class="{ 'p-invalid': formErrors.supplier.phone }" />
              <small v-if="formErrors.supplier.phone" class="p-error">{{ formErrors.supplier.phone }}</small>
            </div>

            <div class="field col-span-1 md:col-span-2">
              <label for="notes" class="block text-gray-700 mb-1">{{ $t('supplier.form.notes') }}</label>
              <TextArea id="notes" v-model="supplierForm.notes" rows="3" class="w-full"
                :placeholder="$t('supplier.form.notesPlaceholder')" />
            </div>
          </div>
        </div>

        <!-- Address Section -->
        <div class="p-card p-4 mb-6">
          <h3 class="text-lg font-semibold mb-4 border-b pb-2">{{ $t('supplier.form.address') }}</h3>

          <AddressForm
            :address="addressData"
            :index="0"
            :is-primary="true"
            :is-expanded="isAddressExpanded"
            :has-multiple-addresses="false"
            :errors="formErrors.address"
            :country-options="countryOptions"
            @toggle-accordion="toggleAddressAccordion"
            @update:address="updateAddress"
          />
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 mt-6">
          <Button type="submit" :loading="isSubmitting">
            <font-awesome :icon="['fas', 'save']" size="sm" class="mr-2" />
            {{ $t("supplier.form.save") }}
          </Button>
          <Button type="button" variant="outlined" :disabled="isSubmitting" @click="resetForm">
            {{ $t("supplier.form.reset") }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>