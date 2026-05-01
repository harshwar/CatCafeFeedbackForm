const puppeteer = require('puppeteer');

/**
 * Generates a PDF report by navigating to the frontend's print view.
 * @param {string} frontendUrl - The base URL of the frontend application.
 * @returns {Promise<Buffer>} - The generated PDF buffer.
 */
async function generateReportPDF(frontendUrl) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to the special print view
    const printUrl = `${frontendUrl.replace(/\/$/, '')}/?view=print`;
    console.log(`[PDF] Navigating to: ${printUrl}`);
    
    await page.goto(printUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the custom flag set by React when charts are finished
    console.log('[PDF] Waiting for charts to stabilize...');
    await page.waitForFunction('window.isReportReady === true', {
      timeout: 10000
    });

    // Capture PDF
    console.log('[PDF] Capturing layout...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      },
      preferCSSPageSize: true
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = { generateReportPDF };
