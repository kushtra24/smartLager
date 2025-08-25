import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";
import { fileURLToPath } from 'url';
import Aura from '@primeuix/themes/aura';

const i18nConfig = {
  locales: [
    { code: "de", name: "Deutsch", file: "de.json" },
    { code: "en", name: "English", file: "en.json" },
    { code: "fr", name: "Français", file: "fr.json" },
  ],
  defaultLocale: "de",
  strategy: "prefix",
};

const fontAwesome = {
  icons: {
    solid: [
      "faUser",
      "faHouse",
      "faBox",
      "faUsers",
      "faTruck",
      "faFileInvoice",
      "faIdCard",
      "faWarehouse",
      "faChevronDown",
      "faChevronRight",
      "faBars",
      "faTimes",
      "faCircle",
      "faSave",
      "faTrash",
      "faTruckRampBox",
      "faPlus",
      "faList",
      "faComment",
      "faExclamation",
      "faTruck",
      "faFileInvoice",
      "faEnvelope",
      "faPhone"
    ],
  },
};

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ["~/assets/css/main.css"],
  app: {
    baseURL: '/', // Adjust the base URL as needed
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./', import.meta.url))
      }
    },
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/image",
    "@primevue/nuxt-module",
    "@nuxtjs/i18n",
    "@vesp/nuxt-fontawesome",
    "@pinia/nuxt",
    "@vueuse/nuxt",
  ],
  typescript: {
    strict: true,
    shim: false
  },
  // Auto-import composables
  imports: {
    dirs: ['composables/**'],
  },
  primevue: {
    autoImport: true,
    options: {
        theme: {
            preset: Aura
        }
    }
  },
  i18n: i18nConfig,
  fontawesome: fontAwesome,
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:8000',
    }
  },
})