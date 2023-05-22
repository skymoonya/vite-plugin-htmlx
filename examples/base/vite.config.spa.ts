import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
// eslint-disable-next-line
// @ts-ignore
import html from '../../src';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    html({
      page: {
        // template: 'index.html',
        // template: 'static/index.html',
        entry: '/src/main.ts',
        inject: {
          data: {
            title: 'test ejs',
          },
        },
      },
    }),
  ],
});
