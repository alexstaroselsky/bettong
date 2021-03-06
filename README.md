# bettong

![bettong](https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Bettongia_gaimardi.jpg/512px-Bettongia_gaimardi.jpg)

WIP: Bettong is a JavaScript Node.js web crawler based in Puppeteer. Based on the provided base URL, Bettong crawls pages on the same origin saves screenshots and HTML content.

## Requirements

Bettong uses [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) which is only available in Node.js 8.x.x or higher.

## Options

| argument           | type               | required | default                                                                                                                          | description                                                                                                                                                                                 |
|--------------------|--------------------|----------|----------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| baseUrl            | string             | true     | null                                                                                                                             | URL to start crawling from. Bettong will only crawl pages that are on the same origin.                                                                                                      |
| outputPath         | string             | false    | "dist"                                                                                                                           | Relative path screenshots and/or html content will be saved to. Currently screenshots will be saved to provided-relative-path/screenshots and HTML content will be saved to provided-relative-path/html.                                                                                           |
| options            | object             | false    | {}                                                                                                                               | Bettong options.                                                                                                                                                                            |
| options.screenshot | boolean            | false    | true                                                                                                                             | Whether Bettong should save screenshot for each viewport.                                                                                                                                   |
| options.html       | boolean            | false    | true                                                                                                                             | Whether Bettong should save HTML content for each page.                                                                                                                                     |
| options.viewports  | puppeteer.Viewport | false    | [   { width: 540, height: 480, },   { width: 720, height: 480 },   { width: 960, height: 480 },   { width: 1140, height: 480 } ] | Array of viewports used to take screenshots. Only used if `options.screenshot` is set to `true`. Please puppeteer docs for more information on available properties for Viewport interface. |

## Usage

### Node.js

Install bettong

```sh
npm install --save bettong
```

```js
const Bettong = require('bettong');

const bettong = new Bettong('https://foo.bar');
await bettong.exec();
```

### CLI

```sh
Usage: bettong exec [options] <base-url>

Execute crawling starting from the required base url <base-url>

Options:
  -o, --output-path <path>         relative output path (default: "dist")
  -e, --exclude-pattern <pattern>  RegExp page exclude pattern (default: "")
  -s, --screenshot <screenshot>    save screenshots (default: true)
  -h, --html <screenshot>          save html content (default: true)
  -v, --viewport <viewport>        viewport for screenshots, e.g. '{"width":128,"height":128}'
  -h, --help                       output usage information
```

Install bettong globally

```sh
npm install -g bettong
```

#### Samples

Start crawling at https://foo.bar and exclude crawling pages that contain `'baz'` in the url.

```sh
bettong exec https://foo.bar -e '.*baz.*'
```

## Output

Bettong will save screenshots to `provided-relative-path/screenshots` and HTML content to `provided-relative-path/html`. By default this would be `dist/screenshots` and `dist/html`. A screenshot will be saved as a full page screenshot in PNG format for each viewport provided in `options.viewports`.
