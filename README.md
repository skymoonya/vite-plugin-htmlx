# vite-plugin-htmlx

**English** | [中文](./README.zh_CN.md)

## Motivation

It seems that [vite-plugin-html](https://github.com/vbenjs/vite-plugin-html) is no longer being updated. I encountered some problems while using it, but the issues and pull requests haven't been addressed for a long time. Therefore, based on the source code and its functionality, I rewrote this plugin.

## Features

- HTML compression
- EJS template
- Multi-page application support
- Supports custom `entry`
- Supports custom `template`

## Installation

**node version:** >=14.18.0

**vite version:** >=4.0.0

```bash
npm i vite-plugin-htmlx -D
```

## Usage

- Add EJS tags in `index.html`, for example:

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%- title %></title>
  <%- injectScript %>
</head>
```

- Configure in `vite.config.ts`. This way, you can import the required functionality on demand.


```ts
import { defineConfig } from 'vite'
import html from 'vite-plugin-htmlx'

export default defineConfig({
  plugins: [
    html({
      minify: true,
      page: {
        /**
         * Once you write the entry here, you will not need to add a script tag inside `index.html`,
         * and the original tag needs to be deleted.
         */
        entry: 'src/main.ts',
        /**
         * If you want to store the `index.html` file in a specified folder,
         * you can modify it, otherwise no configuration is needed
         * @default index.html
         */
        template: 'public/index.html',
        /**
         * Data to inject into the EJS template
         */
        inject: {
          data: {
            title: 'index',
            injectScript: `<script src="./inject.js"></script>`,
          },
          tags: [
            {
              injectTo: 'body-prepend',
              tag: 'div',
              attrs: {
                id: 'tag',
              },
            },
          ],
        },
      },
    }),
  ],
})
```

- Multi-page application configuration

```ts
import { defineConfig } from 'vite'
import html from 'vite-plugin-htmlx'

export default defineConfig({
  plugins: [
    html({
      minify: true,
      page: [
        {
          entry: 'src/main.ts',
          filename: 'index.html',
          template: 'public/index.html',
          inject: {
            data: {
              title: 'index',
              injectScript: `<script src="./inject.js"></script>`,
            },
            tags: [
              {
                injectTo: 'body-prepend',
                tag: 'div',
                attrs: {
                  id: 'tag1',
                },
              },
            ],
          },
        },
        {
          entry: 'src/other-main.ts',
          filename: 'other.html',
          template: 'public/other.html',
          inject: {
            data: {
              title: 'other page',
              injectScript: `<script src="./inject.js"></script>`,
            },
            tags: [
              {
                injectTo: 'body-prepend',
                tag: 'div',
                attrs: {
                  id: 'tag2',
                },
              },
            ],
          },
        },
      ],
    }),
  ],
})
```
In development mode, you can access multi-page pages through `${origin}/filename`, such as:
```
http://127.0.0.1:5173/index.html
http://127.0.0.1:5173/other.html
```
Pages with a `filename` of `index` or `index.html` are the default pages, and navigating to a URL that does not match any page will navigate to this page.

## Parameter Description

`html(options: UserOptions)`

### UserOptions

| Parameter| Type                    | Default Value | Description             |
| -------- | -------------------- -- | ------------- | ----------------------- |
| minify   | `boolean|MinifyOptions` | -             | Whether to compress html |
| page     | `SpaPage | MpaPage[]`   | -             | Page configuration       |

### MpaPage

| Parameter     | Type            | Default Value | Description             |
| ------------- | --------------- | ------------- | ----------------------- |
| filename      | `string`        | -             | HTML file name          |
| template      | `string`        | `index.html`  | Template path           |
| entry         | `string`        | -             | Entry file              |
| inject        | `InjectOptions` | -             | Data injected into HTML |

### SpaPage

| Parameter     | Type            | Default Value | Description             |
| ------------- | --------------- | ------------- | ----------------------- |
| template      | `string`        | `index.html`  | Template path           |
| entry         | `string`        | `src/main.ts` | Entry file              |
| inject        | `InjectOptions` | -             | Data injected into HTML |

### InjectOptions

| Parameter  | Type                  | Default Value | Description                                         |
| ---------- | --------------------- | ------ | ---------------------------------------------------------- |
| data       | `Record<string, any>` | -      | Data injected into HTML                                    |
| ejsOptions | `EJSOptions`          | -      | Ejs configuration options [EJSOptions](https://github.com/mde/ejs#options) |
| tags       | `HtmlTagDescriptor`   | -      | List of tags to be injected                                |

`data` can be accessed in the html with ejs template syntax.

#### env injection

By default, the content of the `.env` file is injected into index.html.

### MinifyOptions

Default minification configuration.

```ts
{
  collapseWhitespace: true,
  keepClosingSlash: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
}
```

## License

MIT
