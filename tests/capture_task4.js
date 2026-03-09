const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

(async function takeScreenshot() {
    let options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--window-size=1200,2200');
    options.addArguments('--hide-scrollbars');

    let driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    try {
        console.log("Loading HTML...");
        await driver.get('file:///c:/temp/code_renderer4.html');

        await driver.sleep(1500);

        console.log("Locating the code element...");
        let element = await driver.findElement(By.id('capture'));

        console.log("Taking native screenshot of the element...");
        let encodedString = await element.takeScreenshot();

        console.log("Saving image payload...");
        fs.writeFileSync('c:\\Users\\User\\.gemini\\antigravity\\brain\\7d5448ef-5c2c-4b13-998c-fbbeab9e9163\\task4_code_screenshot.png', encodedString, 'base64');
        console.log("Done! saved as task4_code_screenshot.png directly to artifact folder");
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await driver.quit();
    }
})();
