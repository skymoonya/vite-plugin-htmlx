import history from 'connect-history-api-fallback';
import fs from 'fs-extra';
import path from 'node:path';
import { render } from 'ejs';
import { minify } from 'html-minifier-terser';
import { normalizePath, loadEnv } from 'vite';
import type { Plugin, ResolvedConfig } from 'vite';
import type { Options as MinifyOptions } from 'html-minifier-terser';
import type { UserOptions, MpaPage, SpaPage } from './types';

const defaultMinifyOptions: MinifyOptions = {
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
};
const ignoreDirs = ['.', '', '/'];
const isEmptyDir = (dir: string) => fs.readdirSync(dir).length === 0;
const removeEmptyDir = (p: string) => {
  if (ignoreDirs.includes(p)) return;
  const isEmpty = isEmptyDir(p);
  if (isEmpty) {
    fs.removeSync(p);
    removeEmptyDir(path.dirname(p));
  }
};

export default function vitePluginHtml(options: UserOptions = {}): Plugin[] {
  const isMpa = Array.isArray(options.page);
  if (Array.isArray(options.page)) {
    const pages = options.page;
    const filenames = new Set<string>();
    pages.forEach((page) => {
      if (page.filename.endsWith('.html')) {
        page.filename = page.filename.replace('.html', '');
      }
      filenames.add(page.filename);
    });
    if (filenames.size !== pages.length) {
      throw new Error('page.filename must be unique');
    }
  }
  let viteConfig: ResolvedConfig;
  const input: Record<string, string> = {};
  let env: Record<string, string>;

  return [
    {
      name: 'vite-plugin-htmlx',
      configResolved(resolvedConfig) {
        viteConfig = resolvedConfig;
        env = loadEnv(viteConfig.mode, process.cwd(), '');
      },
      config(config) {
        const root = path.resolve(config.root || '.');
        if (Array.isArray(options.page)) {
          const cacheDir = 'node_modules/.cache/vite-plugin-htmlx';
          const templates: string[] = [];
          for (const page of options.page) {
            const templatePath = path.join(root, page.template);
            if (templates.includes(templatePath)) {
              const newTemplatePath = path.join(
                root,
                cacheDir,
                `${page.filename}.html`,
              );
              fs.copySync(templatePath, newTemplatePath);
              input[page.filename] = newTemplatePath;
            } else {
              input[page.filename] = templatePath;
              templates.push(templatePath);
            }
          }
        } else if (options.page?.template) {
          input.index = path.join(root, options.page.template);
        }
        return {
          build: {
            rollupOptions: {
              input,
            },
          },
        };
      },
      transformIndexHtml: {
        order: 'pre',
        async transform(html, ctx) {
          let page: MpaPage | SpaPage;
          if (isMpa) {
            const filename = Object.keys(input).find(
              (key) => input[key] === ctx.filename,
            )!;
            page = (options.page as MpaPage[]).find(
              (page) => page.filename === filename,
            )!;
            if (!page) return;
          } else {
            page = (options.page || {}) as SpaPage;
          }
          const { data, ejsOptions } = page.inject || {};
          const ejsData: Record<string, any> = {
            ...viteConfig.env,
            ...viteConfig.define,
            ...env,
            ...data,
          };
          let result = await render(html, ejsData, ejsOptions);
          if (page.entry) {
            result = result.replace(
              '</body>',
              `<script type="module" src="${normalizePath(
                page.entry,
              )}"></script></body>`,
            );
          }
          return {
            html: result,
            tags: page.inject?.tags || [],
          };
        },
      },
      configureServer(server) {
        const rewrites: any[] = [];
        let index = '';
        if (isMpa) {
          for (const filename of Object.keys(input)) {
            if (filename === 'index')
              index = input[filename].replace(viteConfig.root, '');
            rewrites.push({
              from: new RegExp(`^\\/?${filename}(?:\\.html)?$`),
              to: input[filename].replace(viteConfig.root, ''),
            });
          }
        } else if (Object.keys(input).length) {
          rewrites.push({
            from: /.*/,
            to: input[Object.keys(input)[0]].replace(viteConfig.root, ''),
          });
        }
        server.middlewares.use(
          history({
            index,
            disableDotRule: undefined,
            htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
            rewrites,
          }),
        );
      },
      closeBundle() {
        const outputDirs = new Set<string>();
        const outDir = path.resolve(viteConfig.root, viteConfig.build.outDir);
        for (const filename of Object.keys(input)) {
          if (path.dirname(input[filename]) === viteConfig.root) continue;
          const templatePath = input[filename].replace(viteConfig.root, outDir);
          if (fs.existsSync(templatePath)) {
            fs.moveSync(templatePath, path.join(outDir, `${filename}.html`), {
              overwrite: true,
            });
            outputDirs.add(path.dirname(templatePath));
          }
        }
        for (const dir of outputDirs) {
          removeEmptyDir(dir);
        }
      },
    },
    {
      name: 'vite-plugin-htmlx:minify',
      enforce: 'post',
      apply: 'build',
      async transformIndexHtml(html) {
        if (options.minify !== false) {
          let minifyOptions: MinifyOptions;
          if (options.minify === true || !options.minify) {
            minifyOptions = defaultMinifyOptions;
          } else {
            minifyOptions = options.minify;
          }
          return minify(html, minifyOptions);
        }
      },
    },
  ];
}

export type * from './types';
