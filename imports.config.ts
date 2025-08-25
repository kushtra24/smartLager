// The list of your auto-imports
export default defineNuxtConfig({
  imports: {
    dirs: [
      'composables/**',
      'features/**/components/**',
      'features/**/store/**'
    ],
    imports: [
      { name: 'useAuth', from: '~/composables/useAuth' },
      { name: 'resolveImportPath', from: '~/composables/usePaths' }
    ]
  }
})
