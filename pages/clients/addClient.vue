<script lang="ts" setup>
import PageTitle from '~/features/components/base/PageTitle.vue';
import AddClientForm from '../../features/clients/components/AddClientForm.vue';

definePageMeta({
  middleware: ['auth'],
  requiresAuth: true 
});
</script>

<template>
<div>
  <PageTitle :title="$t('clients.addClient')" />
  <AddClientForm />
</div>
</template>