// This file enhances TypeScript's understanding of path aliases in a Nuxt 3 project

// For @ alias
declare module '@/*' {
  const component: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default component;
}

// For ~ alias (legacy Nuxt alias, but still used in many projects)
declare module '~/*' {
  const component: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default component;
}

// For #imports alias
declare module '#imports' {
  export * from 'nuxt/dist/app/compat/capi';
}

// For #components alias
declare module '#components' {
  const component: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export default component;
}

// For i18n
declare module '#i18n' {
  export { useLocalePath, useLocaleRoute } from '@nuxtjs/i18n';
}
