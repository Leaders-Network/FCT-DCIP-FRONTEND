import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    // Worker threads instead of child processes: the default 'forks' pool
    // fails to spawn in some sandboxed Windows shells.
    pool: 'threads',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
