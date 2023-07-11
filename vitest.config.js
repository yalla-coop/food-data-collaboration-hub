import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  //plugins: [react(), tsconfigPaths()],
  test: {
    exclude:[
      ...configDefaults.exclude, 
      'web/dependencies/**'
    ],
    globals: true,
    environment: 'jsdom',
  },
});