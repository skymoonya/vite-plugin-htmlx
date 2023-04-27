# vite-plugin-htmlx

**中文** | [English](./README.md)

## 说明

[vite-plugin-html](https://github.com/vbenjs/vite-plugin-html)似乎已经不再更新了。我在使用的过程中遇到了一些问题，但是`Issue`和`PR`已经很久没有处理过了，所以在参照源代码以及其功能的前提下重新写了这个插件

## 功能

- HTML 压缩
- EJS 模版
- 多页应用支持
- 支持自定义`entry`
- 支持自定义`template`

## 安装

**node version:** >=14.18.0

**vite version:** >=4.0.0

```bash
npm i vite-plugin-htmlx -D
```

## 使用

- 在 `index.html` 中增加 EJS 标签，例如

```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="/favicon.ico" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><%- title %></title>
  <%- injectScript %>
</head>
```

- 在 `vite.config.ts` 中配置,该方式可以按需引入需要的功能即可

```ts
import { defineConfig } from 'vite'
import html from 'vite-plugin-htmlx'

export default defineConfig({
  plugins: [
    html({
      minify: true,
      page: {
        /**
         * 在这里写entry后，你将不需要在`index.html`内添加 script 标签，原有标签需要删除
         */
        entry: 'src/main.ts',
        /**
         * 如果你想将 `index.html`存放在指定文件夹，可以修改它，否则不需要配置
         * @default index.html
         */
        template: 'public/index.html',
        /**
         * 需要注入 ejs 模版的数据
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

- 多页应用配置

```ts
import { defineConfig } from 'vite'
import html from 'vite-plugin-htmlx'

export default defineConfig({
  plugins: [
    createHtmlPlugin({
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
在开发模式中可以通过`${origin}/filename`来访问多页页面，如
```
http://127.0.0.1:5173/index.html
http://127.0.0.1:5173/other.html
```
`filename`为`index`或者`index.html`的页面为默认页面，即URL没有匹配任何页面时将会导航到这个页面

## 参数说明

`htmlx(options: UserOptions)`

### UserOptions

| 参数    | 类型                     | 默认值 | 说明         |
| -------| ------------------------ | ----  | ----------- |
| minify | `boolean | MinifyOptions`| -     | 是否压缩 html |
| page   | `SpaPage | MpaPage[]`    | -     | 页面配置      |

### MpaPage

| 参数          | 类型             | 默认值        | 说明             |
| ------------- | --------------- | ------------- | -------------- |
| filename      | `string`        | -             | html 文件名     |
| template      | `string`        | `index.html`  | 模板的路径       |
| entry         | `string`        | `src/main.ts` | 入口文件        |
| inject        | `InjectOptions` | -             | 注入 HTML 的数据 |

### SpaPage

| 参数      | 类型            | 默认值         | 说明           |
| -------- | --------------- | ------------- | ------------- |
| template | `string`        | `index.html`  | 模板的路径      |
| entry    | `string`        | `src/main.ts` | 入口文件        |
| inject   | `InjectOptions` | -             | 注入 HTML 的数据 |

### InjectOptions

| 参数       | 类型                  | 默认值 | 说明                                                      |
| --------- | --------------------- | ----- | -------------------------------------------------------- |
| data       | `Record<string, any>` | -    | 注入的数据                                                 |
| ejsOptions | `EJSOptions`          | -    | ejs 配置项[EJSOptions](https://github.com/mde/ejs#options) |
| tags       | `HtmlTagDescriptor`   | -    | 需要注入的标签列表                                           |

`data` 可以在 `html` 中使用 `ejs` 模版语法获取

#### env 注入

默认会向 index.html 注入 `.env` 文件的内容

### MinifyOptions

默认压缩配置

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
