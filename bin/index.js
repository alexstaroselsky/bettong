#!/usr/bin/env node

const program = require('commander');
const Bettong = require('../index');

function collect(json, previous) {
  previous = previous || [];

  try {
    const value = JSON.parse(json);
    previous = previous.concat([value]);
  } catch (error) {
    console.error(`Error trying to parse JSON ${json}`);
    process.exit(1);
  }

  return previous;
}

program
  .command('exec <base-url>')
  .description('Execute crawling starting from the required base url <base-url>')
  .option('-o, --output-path <path>', 'relative output path', 'dist')
  .option('-e, --exclude-pattern <pattern>', 'RegExp page exclude pattern', '')
  .option('-s, --screenshot <screenshot>', 'save screenshots', true)
  .option('-h, --html <screenshot>', 'save html content', true)
  .option('-v, --viewport <viewport>', `viewport for screenshots, e.g. '{"width":128,"height":128}'`, collect)
  .action(async function (baseUrl, opts) {
    const {
      outputPath,
      excludePattern,
      screenshot,
      html,
      viewport: viewports } = opts;

    const options = {
      excludePattern,
      screenshot,
      html,
      viewports
    };

    const bettong = new Bettong(baseUrl, outputPath, options);

    try {
      await bettong.exec();

      console.info(`bettong exec completed!`);
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });

program.parse(process.argv);

module.exports = program;
