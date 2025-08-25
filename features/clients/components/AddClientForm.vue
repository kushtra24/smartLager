<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import axiosClient from '@/axiosClient';
import AddressForm from '@/features/addresses/components/AddressForm.vue';

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

interface Client {
  type: 'company' | 'individual';
  companyName: string;
  firstName: string;
  lastName: string;
  taxId: string;
  iban: string;
  email: string;
  phone: string;
  notes: string;
  addresses: Address[];
}

// Form validation state
interface ValidationErrors {
  client: Record<string, string>;
  addresses: Record<string, Record<string, string>>;
}

// Form state
const clientForm = reactive<Client>({
  type: 'company',
  companyName: '',
  firstName: '',
  lastName: '',
  taxId: '',
  iban: '',
  email: '',
  phone: '',
  notes: '',
  addresses: [
    {
      street: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
      isPrimary: true
    }
  ]
});

// Form UI state
const isSubmitting = ref(false);
const formErrors = reactive<ValidationErrors>({
  client: {},
  addresses: {}
});
const successMessage = ref('');
const showSuccessMessage = ref(false);

const expandedAddresses = ref<number[]>([0]); // First address is expanded by default

// Client type options
const clientTypeOptions = [
  { label: 'Company', value: 'company' },
  { label: 'Individual', value: 'individual' }
];

// Country options (example - expand as needed)
const countryOptions = [
  { label: 'Schweiz', value: 'CH' },
];

// Computed properties
const isCompany = computed(() => clientForm.type === 'company');
const hasMultipleAddresses = computed(() => clientForm.addresses.length > 1);

// Methods
const toggleAddressAccordion = (index: number) => {
  const idx = expandedAddresses.value.indexOf(index);
  if (idx === -1) {
    expandedAddresses.value.push(index);
  } else {
    expandedAddresses.value.splice(idx, 1);
  }
};

const addNewAddress = () => {
  const newIndex = clientForm.addresses.length;
  clientForm.addresses.push({
    street: '',
    city: '',
    postalCode: '',
    state: '',
    country: '',
    isPrimary: false
  });
  expandedAddresses.value.push(newIndex);
};

const removeAddress = (index: number) => {
  if (clientForm.addresses.length > 1) {
    // If removing the primary address, set the first remaining address as primary
    if (clientForm.addresses[index].isPrimary && clientForm.addresses.length > 1) {
      const newPrimaryIndex = index === 0 ? 1 : 0;
      clientForm.addresses[newPrimaryIndex].isPrimary = true;
    }

    clientForm.addresses.splice(index, 1);

    // Remove from expanded addresses
    const expandedIndex = expandedAddresses.value.indexOf(index);
    if (expandedIndex !== -1) {
      expandedAddresses.value.splice(expandedIndex, 1);
    }

    // Update expanded indexes for addresses after the removed one
    expandedAddresses.value = expandedAddresses.value.map(idx => {
      return idx > index ? idx - 1 : idx;
    });
  }
};

const setPrimaryAddress = (index: number) => {
  clientForm.addresses.forEach((address, idx) => {
    address.isPrimary = idx === index;
  });
};

const updateAddress = (index: number, updatedAddress: Address) => {
  clientForm.addresses[index] = updatedAddress;
};

// Form validation
const validateForm = (): boolean => {
  // Reset errors
  formErrors.client = {};
  formErrors.addresses = {};

  let isValid = true;

  if (!clientForm.phone) {
    formErrors.client.phone = $t('client.validation.phoneRequired');
    isValid = false;
  }

  // IBAN validation
  if (!clientForm.iban) {
    formErrors.client.iban = $t('client.validation.ibanRequired');
    isValid = false;
  } else {
    // Swiss IBAN validation - should be CH followed by 19 characters, no spaces
    const swissIbanRegex = /^CH[0-9]{19}$/;
    if (!swissIbanRegex.test(clientForm.iban)) {
      formErrors.client.iban = $t('client.validation.invalidSwissIban');
      isValid = false;
    }
  }

  if (clientForm.type === 'individual') {
    if (!clientForm.firstName) {
      formErrors.client.firstName = $t('client.validation.firstNameRequired');
      isValid = false;
    }

    if (!clientForm.lastName) {
      formErrors.client.lastName = $t('client.validation.lastNameRequired');
      isValid = false;
    }
  } else {
    if (!clientForm.companyName) {
      formErrors.client.companyName = $t('client.validation.companyNameRequired');
      isValid = false;
    }
  }

  // Address validation
  clientForm.addresses.forEach((address, index) => {
    formErrors.addresses[index] = {};

    if (!address.street) {
      formErrors.addresses[index].street = $t('client.validation.streetRequired');
      isValid = false;
    }

    if (!address.city) {
      formErrors.addresses[index].city = $t('client.validation.cityRequired');
      isValid = false;
    }

    if (!address.postalCode) {
      formErrors.addresses[index].postalCode = $t('client.validation.postalCodeRequired');
      isValid = false;
    }

    if (!address.state) {
      formErrors.addresses[index].state = $t('client.validation.stateRequired');
      isValid = false;
    }

    if (!address.country) {
      formErrors.addresses[index].country = $t('client.validation.countryRequired');
      isValid = false;
    }
  });

  return isValid;
};

const showToast = (message: string, severity: string) => {
  if (severity === 'success') {
    successMessage.value = message;
    showSuccessMessage.value = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 5000);
  } else {
    // You could implement error messages similarly if needed
    console.error(message);
  }
};

// Form submission
const submitForm = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  showSuccessMessage.value = false;

  try {
    await axiosClient.post('api/clients', clientForm);

    // Show success message
    showToast($t('client.messages.addSuccess'), 'success');
    
    // Reset form after successful save
    resetForm();

  } catch (error: unknown) {
    showToast($t('client.messages.addError'), 'danger');
    console.error('Error submitting form:', error);

    // Handle validation errors from backend
    if (error.response && error.response.data && error.response.data.errors) {
      const backendErrors = error.response.data.errors;

      // Map backend errors to our form error structure
      Object.keys(backendErrors).forEach(key => {
        if (key.startsWith('addresses.')) {
          const parts = key.split('.');
          const index = parseInt(parts[1]);
          const field = parts[2];

          if (!formErrors.addresses[index]) {
            formErrors.addresses[index] = {};
          }

          formErrors.addresses[index][field] = backendErrors[key][0];
        } else {
          formErrors.client[key] = backendErrors[key][0];
        }
      });
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Reset form
const resetForm = () => {
  clientForm.type = 'individual';
  clientForm.companyName = '';
  clientForm.firstName = '';
  clientForm.lastName = '';
  clientForm.taxId = '';
  clientForm.iban = '';
  clientForm.email = '';
  clientForm.phone = '';
  clientForm.notes = '';
  clientForm.addresses = [
    {
      street: '',
      city: '',
      postalCode: '',
      state: '',
      country: '',
      isPrimary: true
    }
  ];

  formErrors.client = {};
  formErrors.addresses = {};
  expandedAddresses.value = [0];
};
</script>

<template>
  <div class="client-form-container max-w-4xl mx-auto p-4">
    <!-- Success message -->
    <Message v-if="showSuccessMessage" severity="success" :closable="true" class="mb-4">
      {{ successMessage }}
    </Message>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">

      <form class="p-6" @submit.prevent="submitForm">
        <!-- Client Type Selection -->
        <div class="mb-6">
          <label class="block text-gray-700 font-semibold mb-2">{{ $t('client.form.clientType') }}</label>
          <Select v-model="clientForm.type" :options="clientTypeOptions" option-label="label" option-value="value"
            class="w-full md:w-auto" />
        </div>

        <!-- Client Information -->
        <div class="p-card p-4 mb-6">
          <h3 class="text-lg font-semibold mb-4 border-b pb-2">{{ $t('client.form.clientInformation') }}</h3>

          <!-- Company Fields (shown only when type is company) -->
          <div v-if="isCompany" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="field">
              <label for="companyName" class="block text-gray-700 mb-1">{{ $t('client.form.companyName') }}*</label>
              <InputText id="companyName" v-model="clientForm.companyName" type="text" class="w-full"
                :class="{ 'p-invalid': formErrors.client.companyName }" />
              <small v-if="formErrors.client.companyName" class="p-error">{{ formErrors.client.companyName }}</small>
            </div>

            <div class="field">
              <label for="taxId" class="block text-gray-700 mb-1">{{ $t('client.form.taxId') }}</label>
              <InputText id="taxId" v-model="clientForm.taxId" type="text" class="w-full"
                :class="{ 'p-invalid': formErrors.client.taxId }" />
              <small v-if="formErrors.client.taxId" class="p-error">{{ formErrors.client.taxId }}</small>
            </div>
            
            <div class="field">
              <label for="iban" class="block text-gray-700 mb-1">{{ $t('client.form.iban') }}*</label>
              <InputText id="iban" v-model="clientForm.iban" type="text" class="w-full"
                :class="{ 'p-invalid': formErrors.client.iban }"
                placeholder="CH0000000000000000000" />
              <small v-if="formErrors.client.iban" class="p-error">{{ formErrors.client.iban }}</small>
              <small class="text-gray-500">{{ $t('client.form.ibanFormat') }}</small>
            </div>
          </div>

          <!-- Individual Fields -->
          <div v-if="!isCompany" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="field">
              <label for="firstName" class="block text-gray-700 mb-1">{{ $t('client.form.firstName') }}*</label>
              <InputText id="firstName" v-model="clientForm.firstName" type="text" class="w-full"
                :class="{ 'p-invalid': formErrors.client.firstName }" />
              <small v-if="formErrors.client.firstName" class="p-error">{{ formErrors.client.firstName }}</small>
            </div>

            <div class="field">
              <label for="lastName" class="block text-gray-700 mb-1">{{ $t('client.form.lastName') }}*</label>
              <InputText id="lastName" v-model="clientForm.lastName" type="text" class="w-full"
                :class="{ 'p-invalid': formErrors.client.lastName }" />
              <small v-if="formErrors.client.lastName" class="p-error">{{ formErrors.client.lastName }}</small>
            </div>

            <div class="field">
              <label for="taxId" class="block text-gray-700 mb-1">{{ $t('client.form.taxId') }}</label>
              <InputText id="taxId" v-model="clientForm.taxId" type="text" class="w-full" />
            </div>
          </div>

          <!-- Common Fields for Both Types -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="field">
              <label for="email" class="block text-gray-700 mb-1">{{ $t('client.form.email') }}</label>
              <InputText id="email" v-model="clientForm.email" class="w-full"
                :class="{ 'p-invalid': formErrors.client.email }" type="email" />
              <small v-if="formErrors.client.email" class="p-error">{{ formErrors.client.email }}</small>
            </div>

            <div class="field">
              <label for="phone" class="block text-gray-700 mb-1">{{ $t('client.form.phone') }}*</label>
              <InputText id="phone" v-model="clientForm.phone" type="text" class="w-full"
                :class="{ 'p-invalid': formErrors.client.phone }" />
              <small v-if="formErrors.client.phone" class="p-error">{{ formErrors.client.phone }}</small>
            </div>

            <div class="field col-span-1 md:col-span-2">
              <label for="notes" class="block text-gray-700 mb-1">{{ $t('client.form.notes') }}</label>
              <TextArea id="notes" v-model="clientForm.notes" rows="3" class="w-full"
                :placeholder="$t('client.form.notesPlaceholder')" />
            </div>
          </div>
        </div>

        <!-- Addresses Section -->
        <div class="p-card p-4 mb-6">
          <div class="flex justify-between items-center mb-4 border-b pb-2">
            <h3 class="text-lg font-semibold">{{ $t('client.form.addresses') }}</h3>
            <Button type="button" class="p-button-sm p-button-outlined" @click="addNewAddress">
              <font-awesome :icon="['fas', 'plus']" size="sm" class="mr-2" />
              {{ $t('client.form.addAddress') }}
            </Button>
          </div>

          <div v-for="(address, index) in clientForm.addresses" :key="index" class="mb-4">
            <AddressForm :address="address" :index="index" :is-primary="address.isPrimary"
              :is-expanded="expandedAddresses.includes(index)" :has-multiple-addresses="hasMultipleAddresses"
              :errors="formErrors.addresses[index]" :country-options="countryOptions"
              @toggle-accordion="toggleAddressAccordion(index)" @set-primary="setPrimaryAddress(index)"
              @remove="removeAddress(index)" @update:address="newAddress => updateAddress(index, newAddress)" />
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end gap-3 mt-6">
          <Button type="submit" :loading="isSubmitting">
            <font-awesome :icon="['fas', 'save']" size="sm" class="mr-2" />
            {{ $t("client.form.save") }}
          </Button>
          <Button type="button" variant="outlined" :disabled="isSubmitting" @click="resetForm">
            {{ $t("client.form.reset") }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>