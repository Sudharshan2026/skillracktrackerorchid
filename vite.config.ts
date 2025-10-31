/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 3000,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'tslib': path.resolve(__dirname, './node_modules/tslib/tslib.es6.js'),
    },
  },
}));