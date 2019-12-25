const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const uuidv4 = require('uuid/v4');

/**
 * puppeteer.Viewport
 * @see {@link https://github.com/puppeteer/puppeteer}
 *
 * @typedef {object} Viewport
 * @property {number} width The page width in pixels.
 * @property {number} height The page height in pixels.
 * @property {number} [deviceScaleFactor=1] Specify device scale factor (can be thought of as dpr).
 * @property {boolean} [isMobile=false] Specify device scale factor (can be thought of as dpr).
 * @property {boolean} [hasTouch=false] Specifies if viewport supports touch events.
 * @property {boolean} [isLandscape=false] Specifies if viewport is in landscape mode.
 */

const defaultOptions = {
  screenshot: true,
  html: true,
  viewports: [
    { width: 540, height: 480, },
    { width: 720, height: 480 },
    { width: 960, height: 480 },
    { width: 1140, height: 480 },
  ]
};

/**
 * Bettong
 */
class Bettong {
  /**
   *
   * @param {string} baseUrl Base URL to start crawling from
   * @param {string} [outputPath="dist"] Relative path for screenshot and content output
   * @param {object} [options={}] Bettong options
   * @param {boolean} [options.screenshot=true] Whether screenshots should be taken and saved
   * @param {boolean} [options.html=true] Whether HTML content should be saved
   * @param {Viewport[]} [options.viewports]
   */
  constructor(baseUrl, outputPath = 'dist', options = {}) {
    // TODO - Validate baseUrl
    this.baseUrl = baseUrl;
    // TODO - Validate outputPath
    this.outputPath = outputPath;
    // TODO - Validate options
    // TODO - Provide option for link selector
    this.options = _.assign({}, defaultOptions, options);

    this.visited = [];
    this.queue = [];
  }

  /**
   * Crawl page
   * @access private
   * @param {object} page
   */
  async _crawl(page) {
    const url = page.url();
    console.info(`Visiting: ${url}`);
    this.visited.push(url);

    // TODO - Use more human friendly value such as page url or title
    const uuid = uuidv4();

    if (this.options.html) {
      // Save page HTML
      const html = await page.content();
      fs.writeFileSync(`dist/content/${uuid}.html`, html);
    }

    if (this.options.screenshot) {
      // Save screenshot for every viewport
      for (const viewport of this.options.viewports) {
        console.info(`Taking full page screenshot of ${url} at size ${viewport.width}px by ${viewport.height}px`)
        await page.setViewport({ ...viewport });
        await page.screenshot({
          path: `dist/screenshots/${uuid}_${viewport.width}x${viewport.height}.png`,
          type: 'png',
          fullPage: true
        });
      }
    }

    const anchors = await page.$$('a');
    for (const anchor of anchors) {
      const hrefHandle = await anchor.getProperty('href');
      let href = await hrefHandle.jsonValue();
      // TODO - Provide option for keeping query params
      const idx = href.indexOf('#');
      if (idx > -1) {
        href = href.substring(0, idx);
      }

      // Limit to pages on same origin
      if (href.includes(this.baseUrl) && !_.includes(this.visited, href) && !_.includes(this.queue, href)) {
        this.queue.push(href);
      }
    }

    const nextUrl = this.queue.shift();
    if (!nextUrl) return;
    const nextPage = await this.context.newPage();
    await nextPage.goto(nextUrl, { waitUntil: 'load' });

    return this._crawl(nextPage);
  }

  /**
   * Execute crawling
   *
   * @access public
   */
  async exec() {
    const relativePath = path.resolve(this.outputPath);
    if (!fs.existsSync(relativePath)) {
      if (this.options.screenshot) {
        // Create directory for screenshot output
        console.info(`Creating sceenshot output directory at ${relativePath}/screenshots`);
        fs.mkdirSync(`${relativePath}/screenshots`, { recursive: true });
      }
      if (this.options.html) {
        // Create directory for html output
        console.info(`Creating html output directory at ${relativePath}/html`)
        fs.mkdirSync(`${relativePath}/html`, { recursive: true });
      }
    }

    const browser = await puppeteer.launch();
    this.context = await browser.createIncognitoBrowserContext();
    const page = await this.context.newPage();
    await page.goto(this.baseUrl, { waitUntil: 'load' });

    // TODO - Prevent redirects
    // https://github.com/puppeteer/puppeteer/issues/1132#issuecomment-393724933
    await this._crawl(page);

    await this.context.close();
  }
}

module.exports = Bettong;
