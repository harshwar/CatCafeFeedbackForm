const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to be inside the project folder.
  // This ensures Render includes the browser in the final deployment.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
