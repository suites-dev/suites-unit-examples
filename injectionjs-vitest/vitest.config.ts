import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Preserve InjectionJS decorator and token identity across native imports.
    server: { deps: { external: ['injection-js'] } },
    root: './',
    include: ['tests/**/*.spec.ts']
  },
  plugins: [swc.vite({ module: { type: 'es6' } })]
});
