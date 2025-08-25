<template>
  <div>
    <template v-if="loading">
      <SkeletonLoading />
    </template>
    <div v-else class="home-grid">
      <div
        v-for="(item, key) in dashboardData"
        :key="key"
        class="col-span-12 md:col-span-6 xl:col-span-2"
      >
        <Card @click="() => $router.push(item.link)">
          <template #title>
            <span class="font-semibold text-lg">{{ item.key }}</span>
          </template>
          <template #content>
            <div class="flex justify-between items-start mt-4">
              <div class="w-6/12">
                <span
                  class="text-4xl font-bold text-surface-900 dark:text-surface-0"
                  >{{ item.count }}</span
                >
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SkeletonLoading from "@/features/components/base/SkeletonLoading.vue";
import axiosClient from "@/axiosClient";

definePageMeta({
  middleware: ["auth"],
  requiresAuth: true,
});

const dashboardData = ref([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  await getDashboardData();
  loading.value = false;
});

const getDashboardData = async () => {
  try {
    const response = await axiosClient.get("/api/dashboard");
    const data = response.data.data;

    dashboardData.value = [
      { key: "Users", count: data.users_count, link: "/users" },
      {
        key: "Shipments",
        count: data.shipments_count,
        link: "/shipments",
      },
      {
        key: "Invoices",
        count: data.invoices_count,
        link: "/invoices",
      },
      {
        key: "Suppliers",
        count: data.suppliers_count,

        link: "/suppliers",
      },
      { key: "Clients", count: data.clients_count, link: "/clients" },
      {
        key: "Products",
        count: data.products_count,

        link: "/products",
      },
    ];
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    dashboardData.value = [];
  }
};
</script>

<style scoped>
.home-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(12, 1fr);
}
</style>
