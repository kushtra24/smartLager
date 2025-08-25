<template>
  <Drawer v-model:visible="visible" :modal="true" :dismissable-mask="true" :show-close-icon="false" position="left" class="side-drawer">
    <div class="p-4 flex flex-col h-full bg-white">
      <!-- Close Icon -->
      <font-awesome
        :icon="['fas', 'times']" size="lg" aria-label="Close drawer"
        tabindex="0"
        role="button"
        class="text-xl absolute right-4 top-4 cursor-pointer z-20"
        @click="() => { blurIfInsideDrawer(); visible = false; }"
      />

      <!-- User Profile -->
      <div
        class="flex items-center gap-3 mb-6 mt-2 cursor-pointer hover:bg-surface-100 rounded transition-colors"
        role="button"
        tabindex="0"
        :aria-label="user ? 'Go to profile' : 'Go to login'"
        @click="() => { user ? router.push(`/users/${user.id}`) : goToLogin(); }"
      >
        <Avatar shape="circle" size="large">
          <font-awesome :icon="['fas', 'user']" size="lg" />
        </Avatar>
        <div v-if="user">
          <div class="font-semibold">{{ user.name }}</div>
          <div class="text-xs text-gray-500">{{ user.email }}</div>
        </div>
        <div v-else>
          <div class="font-semibold">Guest</div>
          <div class="text-xs text-gray-500">Not logged in</div>
        </div>
      </div>
      <!-- Navigation -->
      <nav class="flex-1">
        <ul class="space-y-2">
          <li>
            <NuxtLink to="/" class="drawer-link">
              <font-awesome :icon="['fas', 'house']" class="mr-2" />{{ t('nav.dashboard') }}
            </NuxtLink>
          </li>
          
          <!-- Products dropdown -->
          <li>
            <ul class="list-none py-0 pl-0 pr-0 m-0">
              <li>
                <a
                  href="#"
                  class="flex items-center cursor-pointer p-2 rounded text-surface-700 hover:bg-surface-100 duration-150 transition-colors drawer-link"
                  :aria-expanded="productsOpen"
                  :aria-controls="'products-menu'"
                  @click.prevent="toggleProducts"
                >
                  <font-awesome :icon="['fas', 'box']" class="mr-2" />
                  <span class="font-medium">{{ t ? t('nav.products') : 'Products' }}</span>
                  <font-awesome :icon="['fas', productsOpen ? 'chevron-down' : 'chevron-right']" class="ml-auto" />
                </a>
                <ul
                  id="products-menu"
                  class="list-none py-0 pl-4 pr-0 m-0 overflow-y-hidden transition-all duration-[400ms] ease-in-out"
                  :class="{ 'hidden': !productsOpen }"
                >
                  <li>
                    <NuxtLink :to="localePath('/products')" class="drawer-link">
                      <font-awesome :icon="['fas', 'list']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ t ? t('nav.viewProducts') : 'View Products' }}</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink :to="localePath('/products/addProduct')" class="drawer-link">
                      <font-awesome :icon="['fas', 'plus']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ t ? t('addNewProduct') : 'Add Product' }}</span>
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          
          <!-- Shipments dropdown -->
          <li>
            <ul class="list-none py-0 pl-0 pr-0 m-0">
              <li>
                <a
                  href="#"
                  class="flex items-center cursor-pointer p-2 rounded text-surface-700 hover:bg-surface-100 duration-150 transition-colors drawer-link"
                  :aria-expanded="shipmentsOpen"
                  :aria-controls="'shipments-menu'"
                  @click.prevent="toggleShipments"
                >
                  <font-awesome :icon="['fas', 'truck-loading']" class="mr-2" />
                  <span class="font-medium">{{ t ? t('nav.shipments') : 'Shipments' }}</span>
                  <font-awesome :icon="['fas', shipmentsOpen ? 'chevron-down' : 'chevron-right']" class="ml-auto" />
                </a>
                <ul
                  id="shipments-menu"
                  class="list-none py-0 pl-4 pr-0 m-0 overflow-y-hidden transition-all duration-[400ms] ease-in-out"
                  :class="{ 'hidden': !shipmentsOpen }"
                >
                  <li>
                    <NuxtLink :to="localePath('/shipments')" class="drawer-link">
                      <font-awesome :icon="['fas', 'list']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ t ? t('nav.viewShipments') : 'View Shipments' }}</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink :to="localePath('/shipments/addShipment')" class="drawer-link">
                      <font-awesome :icon="['fas', 'plus']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ t ? t('shipments.addShipment') : 'Add Shipment' }}</span>
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          
          <!-- Clients dropdown -->
          <li>
            <ul class="list-none py-0 pl-0 pr-0 m-0">
              <li>
                <a
                  href="#"
                  class="flex items-center cursor-pointer p-2 rounded text-surface-700 hover:bg-surface-100 duration-150 transition-colors drawer-link"
                  :aria-expanded="clientsOpen"
                  :aria-controls="'clients-menu'"
                  @click.prevent="toggleClients"
                >
                  <font-awesome :icon="['fas', 'users']" class="mr-2" />
                  <span class="font-medium">{{ t ? t('nav.clients') : 'Clients' }}</span>
                  <font-awesome :icon="['fas', clientsOpen ? 'chevron-down' : 'chevron-right']" class="ml-auto" />
                </a>
                <ul
                  id="clients-menu"
                  class="list-none py-0 pl-4 pr-0 m-0 overflow-y-hidden transition-all duration-[400ms] ease-in-out"
                  :class="{ 'hidden': !clientsOpen }"
                >
                  <li>
                    <NuxtLink :to="localePath('/clients')" class="drawer-link">
                      <font-awesome :icon="['fas', 'list']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ t ? t('nav.viewClients') : 'View Clients' }}</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink :to="localePath('/clients/addClient')" class="drawer-link">
                      <font-awesome :icon="['fas', 'plus']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ t ? t('clients.addClient') : 'Add Client' }}</span>
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          
          <!-- Suppliers dropdown -->
          <li>
            <ul class="list-none py-0 pl-0 pr-0 m-0">
              <li>
                <a
                  href="#"
                  class="flex items-center cursor-pointer p-2 rounded text-surface-700 hover:bg-surface-100 duration-150 transition-colors drawer-link"
                  :aria-expanded="suppliersOpen"
                  :aria-controls="'suppliers-menu'"
                  @click.prevent="toggleSuppliers"
                >
                  <font-awesome :icon="['fas', 'truck']" class="mr-2" />
                  <span class="font-medium">{{ t ? t('nav.supplier') : 'Suppliers' }}</span>
                  <font-awesome :icon="['fas', suppliersOpen ? 'chevron-down' : 'chevron-right']" class="ml-auto" />
                </a>
                <ul
                  id="suppliers-menu"
                  class="list-none py-0 pl-4 pr-0 m-0 overflow-y-hidden transition-all duration-[400ms] ease-in-out"
                  :class="{ 'hidden': !suppliersOpen }"
                >
                  <li>
                    <NuxtLink :to="localePath('/suppliers')" class="drawer-link">
                      <font-awesome :icon="['fas', 'list']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ t ? t('nav.viewSuppliers') : 'View Suppliers' }}</span>
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink :to="localePath('/suppliers/addSuppliers')" class="drawer-link">
                      <font-awesome :icon="['fas', 'plus']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ t ? t('suppliers.addSupplier') : 'Add Supplier' }}</span>
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          
          <li>
            <NuxtLink :to="localePath('/invoices')" class="drawer-link">
              <font-awesome :icon="['fas', 'file-invoice']" class="mr-2" />{{ t('nav.invoices') }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/users')" class="drawer-link">
              <font-awesome :icon="['fas', 'id-card']" class="mr-2" />{{ t('nav.users') }}
            </NuxtLink>
          </li>
          
          <!-- Warehouse dropdown -->
          <li>
            <ul class="list-none py-0 pl-0 pr-0 m-0">
              <li>
                <a
                  href="#"
                  class="flex items-center cursor-pointer p-2 rounded text-surface-700 hover:bg-surface-100 duration-150 transition-colors drawer-link"
                  :aria-expanded="warehouseOpen"
                  :aria-controls="'warehouse-menu'"
                  @click.prevent="toggleWarehouse"
                >
                  <font-awesome :icon="['fas', 'warehouse']" class="mr-2" />
                  <span class="font-medium">{{ t ? t('nav.warehouse') : 'Warehouse' }}</span>
                  <font-awesome :icon="['fas', warehouseOpen ? 'chevron-down' : 'chevron-right']" class="ml-auto" />
                </a>
                <ul
                  id="warehouse-menu"
                  class="list-none py-0 pl-4 pr-0 m-0 overflow-y-hidden transition-all duration-[400ms] ease-in-out"
                  :class="{ 'hidden': !warehouseOpen }"
                >
                  <li v-for="item in warehouseItems" :key="item.label">
                    <a
                      href="#"
                      class="flex items-center cursor-not-allowed p-2 rounded text-surface-700 opacity-50 drawer-link"
                      tabindex="-1"
                    >
                      <font-awesome :icon="['fas', 'circle']" class="mr-2 text-xs" />
                      <span class="font-medium">{{ item.label }}</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- Language Switcher Dropdown -->
      <div class="mt-auto pt-4">
        <Select
          v-model="selectedLocale"
          :options="locales"
          option-label="label"
          option-value="code"
          class="w-full"
          :placeholder="t ? t('nav.language') : 'Language'"
          @change="onLocaleChange"
        ></Select>
      </div>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
import { ref, defineProps, watch, onMounted, onUnmounted } from 'vue';
import Drawer from 'primevue/drawer';
import Avatar from 'primevue/avatar';
import Select from 'primevue/select';
import { useRouter } from 'vue-router';
import { useLocalePath, useSwitchLocalePath } from '#imports';
import { useI18n } from 'vue-i18n';
const { user } = useAuth();

const { t } = useI18n();

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits(['update:visible']);
const visible = ref(props.visible);
watch(() => props.visible, v => visible.value = v);
watch(visible, v => emit('update:visible', v));

// Products dropdown control
const productsOpen = ref(false);
function toggleProducts() {
  productsOpen.value = !productsOpen.value;
}

// Shipments dropdown control
const shipmentsOpen = ref(false);
function toggleShipments() {
  shipmentsOpen.value = !shipmentsOpen.value;
}

// Clients dropdown control
const clientsOpen = ref(false);
function toggleClients() {
  clientsOpen.value = !clientsOpen.value;
}

// Suppliers dropdown control
const suppliersOpen = ref(false);
function toggleSuppliers() {
  suppliersOpen.value = !suppliersOpen.value;
}

const warehouseOpen = ref(false);
const warehouseItems = [
  { label: 'Inventories' },
  { label: 'Stock' },
  { label: 'Picks' },
  { label: 'Internal Transport' },
  { label: 'Transportation' },
];
function toggleWarehouse() {
  warehouseOpen.value = !warehouseOpen.value;
}

const locales = [
  { label: 'Deutsch', code: 'de' },
  { label: 'English', code: 'en' },
  { label: 'Français', code: 'fr' }
];


// Detect current locale from route or default to 'en'
const router = useRouter();
const currentLocale = ref(router.currentRoute.value.params.locale || 'de');
const selectedLocale = ref(currentLocale.value);
const switchLocalePath = useSwitchLocalePath();
const localePath = useLocalePath();

function onLocaleChange(e: string | { value: string }) {
  const localeCode = (typeof e === 'string' ? e : e.value) as "en" | "de";
  const path = switchLocalePath(localeCode);
  router.push(path);
}

function blurIfInsideDrawer() {
  // Find the drawer element
  const drawerEl = document.querySelector('.side-drawer');
  if (!drawerEl) return;
  const active = document.activeElement as HTMLElement | null;
  if (active && drawerEl.contains(active)) {
    active.blur();
    // Optionally, move focus to body
    (document.body as HTMLElement).focus?.();
  }
}

// Close drawer on route change
let unwatchRoute: (() => void) | null = null;
onMounted(() => {
  unwatchRoute = router.afterEach(() => {
    blurIfInsideDrawer();
    visible.value = false;
  });
});
onUnmounted(() => {
  if (unwatchRoute) unwatchRoute();
});

function goToLogin() {
  // Replace this with your actual auth logic or composable
  // const auth = useAuth?.() ?? { loggedIn: false };
  // if (auth.loggedIn) {
  //   router.push('/user');
  // } else {
    router.push('/auth/login');
  // }
}
</script>

<style scoped>
.side-drawer {
  width: 270px;
  position: relative;
}
.drawer-link {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  color: #374151;
  font-weight: 500;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  transition: background 0.2s;
}
.drawer-link:hover:not(.disabled-link) {
  background: #f3f4f6;
}
.disabled-link {
  opacity: 0.5;
  pointer-events: none;
}
</style>
