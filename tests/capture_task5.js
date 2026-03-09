const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set a large viewport
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

    // Load the HTML file
    const fileUrl = 'file://' + path.resolve('C:\\temp\\code_renderer5.html');
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Take a screenshot of the window element
    const element = await page.$('.window');
    await element.screenshot({ path: 'C:\\Users\\User\\.gemini\\antigravity\\brain\\7d5448ef-5c2c-4b13-998c-fbbeab9e9163\\task5_code_screenshot.png' });

    console.log('Snapshot successfully captured for Task 5: test_report_5 block.');
    await browser.close();
})();
