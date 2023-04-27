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
      page: [
        {
          filename: 'index',
          template: 'index.html',
          entry: '/src/main.ts',
          inject: {
            data: {
              title: 'ejs index',
            },
          },
        },
        {
          filename: 'index1',
          template: '/src/page1/index.html',
          entry: '/src/page1/main.ts',
          inject: {
            data: {
              title: 'ejs index1',
            },
          },
        },
        {
          filename: 'index2',
          template: '/src/page2/index.html',
          entry: '/src/page2/main.ts',
          inject: {
            data: {
              title: 'ejs index2',
            },
          },
        },
        {
          filename: 'index3',
          template: '/src/page3/index.html',
          entry: '/src/page3/main.ts',
          inject: {
            data: {
              title: 'ejs index3',
            },
          },
        },
      ],
    }),
  ],
});
