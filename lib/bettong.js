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
   * @param {string} [options.excludePattern] RegExp expression to exclude pages from crawling
   * @param {Viewport[]} [options.viewports]
   */
  constructor(baseUrl, outputPath = 'dist', options = {}) {
    // TODO - Validate baseUrl
    this.baseUrl = baseUrl;
    // TODO - Validate outputPath
    this.outputPath = outputPath;
    // TODO - Validate options
    // TODO - Provide option for link selector
    this.options = _.assign({}, defaultOptions, this._sanitizeOptions(options));

    this.visited = [];
    this.queue = [];
  }

  /**
   * @access private
   *
   * Crawl page
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
      fs.writeFileSync(`${this.relativePath}/html/${uuid}.html`, html);
    }

    if (this.options.screenshot) {
      // Save screenshot for every viewport
      for (const viewport of this.options.viewports) {
        console.info(`Taking full page screenshot of ${url} at size ${viewport.width}px by ${viewport.height}px`)
        await page.setViewport({ ...viewport });
        await page.screenshot({
          path: `${this.relativePath}/screenshots/${uuid}_${viewport.width}x${viewport.height}.png`,
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

      if (this._isValidPage(href)) {
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
   * @access private
   *
   * Check if page should be crawled. Checks the following
   * - Does href include base url?
   * - Has href not been added to array of visisted pages?
   * - Has href not been added to array of queued pages?
   * - Does href not match exclude RegExp pattern?
   *
   * @param {string} href
   */
  _isValidPage(href) {
    let isValid = false;

    isValid = href.includes(this.baseUrl) &&
      !_.includes(this.visited, href) &&
      !_.includes(this.queue, href);

    if (this.options.excludePattern) {
      const regex = new RegExp(this.options.excludePattern, 'g');
      isValid = isValid && !regex.test(href);
    }

    if (!isValid) {
      console.info(`Excluding crawling page ${href}`);
    }

    return isValid;
  }

  /**
   * @access private
   *
   * Remove undefined values from options object
   *
   * @param {object} options
   * @returns {object}
   */
  _sanitizeOptions(options) {
    return _.transform(options, function (result, value, key) {
      if (!_.isNil(value)) result[key] = value;
    }, {});
  }

  /**
   * Execute crawling
   *
   * @access public
   */
  async exec() {
    this.relativePath = path.resolve(this.outputPath);
    if (!fs.existsSync(this.relativePath)) {
      if (this.options.screenshot) {
        // Create directory for screenshot output
        console.info(`Creating sceenshot output directory at ${this.relativePath}/screenshots`);
        fs.mkdirSync(`${this.relativePath}/screenshots`, { recursive: true });
      }
      if (this.options.html) {
        // Create directory for html output
        console.info(`Creating html output directory at ${this.relativePath}/html`)
        fs.mkdirSync(`${this.relativePath}/html`, { recursive: true });
      }
    }

    const browser = await puppeteer.launch();
    this.context = await browser.createIncognitoBrowserContext();
    const page = await this.context.newPage();
    await page.goto(this.baseUrl, { waitUntil: 'load' });

    if (this._isValidPage(page.url())) {
      // TODO - Prevent redirects
      // https://github.com/puppeteer/puppeteer/issues/1132#issuecomment-393724933
      await this._crawl(page);
    }

    await this.context.close();
  }
}

module.exports = Bettong;
