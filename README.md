# bettong

WIP: Bettong is a JavaScript web crawler. Based on the provided base URL, Bettong crawls pages on the same origin saves screenshots and HTML content.

## Options

| argument           | type               | required | default                                                                                                                          | description                                                                                                                                                                                 |
|--------------------|--------------------|----------|----------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| baseUrl            | string             | true     | null                                                                                                                             | URL to start crawling from. Bettong will only crawl pages that are on the same origin.                                                                                                      |
| outputPath         | string             | false    | "dist"                                                                                                                           | WIP: Relative path screenshots and/or html content will be saved to in relation to process.cwd().                                                                                           |
| options            | object             | false    | {}                                                                                                                               | Bettong options.                                                                                                                                                                            |
| options.screenshot | boolean            | false    | true                                                                                                                             | Whether Bettong should save screenshot for each viewport.                                                                                                                                   |
| options.html       | boolean            | false    | true                                                                                                                             | Whether Bettong should save HTML content for each page.                                                                                                                                     |
| options.viewports  | puppeteer.Viewport | false    | [   { width: 540, height: 480, },   { width: 720, height: 480 },   { width: 960, height: 480 },   { width: 1140, height: 480 } ] | Array of viewports used to take screenshots. Only used if `options.screenshot` is set to `true`. Please puppeteer docs for more information on available properties for Viewport interface. |

## Usage

```js
const Bettong = require('bettong');

const bettong = new Bettong('https://foo.bar');
await bettong.exec();

```

## Output

Bettong will save screenshots to `dist/screenshots` and HTML content to `dist/html`.
