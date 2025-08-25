<template>
  <div class="card mt-6">
    <DataTable 
      :value="items" 
      table-style="min-width: 50rem" 
      :loading="loading" 
      striped-rows 
      :lazy="true"
      :total-records="totalRecords"
      :paginator="true" 
      :rows="rows" 
      :rows-per-page-options="[5, 10, 20, 50]"
      :first="first"
      @page="onPage"
      @row-click="onRowClick"
      @sort="onSort"
      :sort-field="sortField"
      :sort-order="sortOrder">
      <Column v-for="col of columns" :key="col.field" sortable :field="col.field" :header="col.header" />
    </DataTable>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axiosClient from '@/axiosClient';

const props = defineProps({
  resourceName: {
    type: String,
    default: ''
  },
  columns: {
    type: Array,
    default: () => []
  }
});

const router = useRouter();
const items = ref([]);
const loading = ref(true);
const columns = ref(props.columns);

// Pagination state
const totalRecords = ref(0);
const rows = ref(10);
const first = ref(0);
const currentPage = ref(1);

// Sorting state
const sortField = ref(props.columns.length > 0 ? props.columns[0].field : 'id');
const sortOrder = ref(-1); // -1 for descending, 1 for ascending

async function fetchData(page = 1, perPage = rows.value) {
  try {
    loading.value = true;
    const response = await axiosClient.get(`api/${props.resourceName}`, {
      params: {
        page: page,
        per_page: perPage,
        sort_field: sortField.value,
        sort_order: sortOrder.value === -1 ? 'desc' : 'asc'
      }
    });
    
    items.value = response.data.data;
    totalRecords.value = response.data.total || 0;
  } catch (error) {
    console.error('Error fetching items:', error);
  } finally {
    loading.value = false;
  }
}

function onPage(event) {
  first.value = event.first;
  rows.value = event.rows;
  currentPage.value = event.page + 1; // PrimeVue uses 0-based index for pages
  
  fetchData(currentPage.value, rows.value);
}

function onSort(event) {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
  fetchData(currentPage.value, rows.value);
}

onMounted(() => {
  fetchData();
});

function onRowClick(event: { data: unknown }) {
  const id = event.data.id;
  router.push(`/${props.resourceName}/${id}`);
}
</script>
