<script lang="ts" setup>

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

// Props definition
const props = defineProps<{
  address: Address;
  index: number;
  isPrimary: boolean;
  isExpanded: boolean;
  hasMultipleAddresses: boolean;
  errors: Record<string, string> | undefined;
  countryOptions: Array<{ label: string; value: string }>;
}>();

// Emits definition
const emit = defineEmits<{
  (e: 'toggle-accordion'): void;
  (e: 'set-primary'): void;
  (e: 'remove'): void;
  (e: 'update:address', value: Address): void;
}>();

// Methods
const updateAddress = (field: keyof Address, value: any) => {
  const updatedAddress = { ...props.address, [field]: value };
  emit('update:address', updatedAddress);
};
</script>

<template>
  <div class="p-card p-card-secondary p-3 border border-gray-200 rounded">
    <div class="flex justify-between items-center cursor-pointer mb-2" @click="emit('toggle-accordion')">
      <div class="flex items-center">
        <Badge v-if="isPrimary" :value="$t('client.form.primary')" severity="success" class="mr-2" />
        <h4 class="font-medium">
          {{ address.street ? `${address.street}, ${address.city}` : $t('client.form.addressNumber', { number: index + 1 }) }}
        </h4>
      </div>
      <div class="flex">
        <Button v-if="!isPrimary" type="button" class="p-button-text p-button-sm mr-1" 
          :tooltip="$t('client.form.setAsPrimary')" @click.stop="emit('set-primary')">
          <font-awesome :icon="['fas', 'star']" size="sm" />
        </Button>
        <Button v-if="hasMultipleAddresses" type="button" class="p-button-text p-button-danger p-button-sm mr-1" 
          :tooltip="$t('client.form.removeAddress')" @click.stop="emit('remove')">
          <font-awesome :icon="['fas', 'trash']" size="sm" />
        </Button>
        <font-awesome 
          :icon="['fas', isExpanded ? 'chevron-up' : 'chevron-down']" 
          size="sm" 
          class="text-gray-500"
        />
      </div>
    </div>

    <div v-if="isExpanded" class="address-fields pt-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field">
          <label :for="`street-${index}`" class="block text-gray-700 mb-1">{{ $t('client.form.street') }}*</label>
          <InputText 
            :id="`street-${index}`" 
            :value="address.street" 
            type="text" 
            class="w-full"
            :class="{ 'p-invalid': errors?.street }" 
            @input="e => updateAddress('street', e.target.value)"
          />
          <small v-if="errors?.street" class="p-error">{{ errors.street }}</small>
        </div>

        <div class="field">
          <label :for="`city-${index}`" class="block text-gray-700 mb-1">{{ $t('client.form.city') }}*</label>
          <InputText 
            :id="`city-${index}`" 
            :value="address.city" 
            type="text" 
            class="w-full"
            :class="{ 'p-invalid': errors?.city }" 
            @input="e => updateAddress('city', e.target.value)"
          />
          <small v-if="errors?.city" class="p-error">{{ errors.city }}</small>
        </div>

        <div class="field">
          <label :for="`postalCode-${index}`" class="block text-gray-700 mb-1">{{ $t('client.form.postalCode') }}*</label>
          <InputText 
            :id="`postalCode-${index}`" 
            :value="address.postalCode" 
            type="text" 
            class="w-full"
            :class="{ 'p-invalid': errors?.postalCode }" 
            @input="e => updateAddress('postalCode', e.target.value)"
          />
          <small v-if="errors?.postalCode" class="p-error">{{ errors.postalCode }}</small>
        </div>

        <div class="field">
          <label :for="`state-${index}`" class="block text-gray-700 mb-1">{{ $t('client.form.state') }}*</label>
          <InputText 
            :id="`state-${index}`" 
            :value="address.state" 
            type="text" 
            class="w-full"
            :class="{ 'p-invalid': errors?.state }" 
            @input="e => updateAddress('state', e.target.value)"
          />
          <small v-if="errors?.state" class="p-error">{{ errors.state }}</small>
        </div>

        <div class="field md:col-span-2">
          <label :for="`country-${index}`" class="block text-gray-700 mb-1">{{ $t('client.form.country') }}*</label>
          <Select 
            :id="`country-${index}`" 
            :modelValue="address.country" 
            :options="countryOptions"
            option-label="label" 
            option-value="value" 
            :placeholder="$t('client.form.selectCountry')"
            class="w-full" 
            :class="{ 'p-invalid': errors?.country }" 
            @update:modelValue="value => updateAddress('country', value)"
          />
          <small v-if="errors?.country" class="p-error">{{ errors.country }}</small>
        </div>
      </div>
    </div>
  </div>
</template>
