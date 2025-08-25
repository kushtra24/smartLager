<script lang="ts" setup>
import LoginForm from '@/features/users/components/LoginForm.vue'

definePageMeta({
	middleware: ['auth'],
	guestOnly: true
});
</script>

<template>
	<div class="login-page">
		<LoginForm />
	</div>
</template>