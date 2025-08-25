<template>
  <div
    v-if="variant === 'default'"
    class="rounded border border-surface-200 dark:border-surface-700 p-6 bg-surface-0 dark:bg-surface-900"
  >
    <ul class="m-0 p-0 list-none">
      <li class="mb-4">
        <div class="flex">
          <Skeleton shape="circle" size="4rem" class="mr-2"></Skeleton>
          <div class="self-center" style="flex: 1">
            <Skeleton width="100%" class="mb-2"></Skeleton>
            <Skeleton width="75%"></Skeleton>
          </div>
        </div>
      </li>
      <li class="mb-4">
        <div class="flex">
          <Skeleton shape="circle" size="4rem" class="mr-2"></Skeleton>
          <div class="self-center" style="flex: 1">
            <Skeleton width="100%" class="mb-2"></Skeleton>
            <Skeleton width="75%"></Skeleton>
          </div>
        </div>
      </li>
      <li class="mb-4">
        <div class="flex">
          <Skeleton shape="circle" size="4rem" class="mr-2"></Skeleton>
          <div class="self-center" style="flex: 1">
            <Skeleton width="100%" class="mb-2"></Skeleton>
            <Skeleton width="75%"></Skeleton>
          </div>
        </div>
      </li>
      <li>
        <div class="flex">
          <Skeleton shape="circle" size="4rem" class="mr-2"></Skeleton>
          <div class="self-center" style="flex: 1">
            <Skeleton width="100%" class="mb-2"></Skeleton>
            <Skeleton width="75%"></Skeleton>
          </div>
        </div>
      </li>
    </ul>
  </div>

  <div v-if="variant === 'small'">
    <Skeleton width="10rem" height="4rem" class="mb-2"></Skeleton>
    <Skeleton width="10rem" class="mb-2"></Skeleton>
    <Skeleton width="5rem" class="mb-8"></Skeleton>
    <Skeleton height="2rem" class="mb-2"></Skeleton>
    <Skeleton height="2rem" class="mb-2"></Skeleton>
    <Skeleton height="2rem" class="mb-2"></Skeleton>
    <Skeleton height="2rem" class="mb-2"></Skeleton>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: "default",
  },
});
</script>
